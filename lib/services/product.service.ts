import { db } from "../db/db";
import { and, eq, inArray, ilike, type SQL } from "drizzle-orm";
import {
  productGroups,
  productVariants,
  products,
  productVariantCombinations,
  type SelectProductGroup,
  type SelectProductVariant,
  type SelectProduct,
} from "../db/schema";
import { CompleteProduct, ProductFilters } from "@/hooks/use-products";
import { UserRole } from "../enums";
import { hasPermission } from "../utils/permissions";

type WhereCondition = SQL<unknown> | undefined;
type VariantSelection = Record<string, string>;

// === Permission Configuration ===
const PERMISSIONS = {
  user: { canViewInactive: false },
  admin: { canViewInactive: true },
  super_admin: { canViewInactive: true },
} as const;

// === Query Filter Builders ===

// Filters based on user input (search, category, brand, etc.)
function createUserInputFilters(filters: ProductFilters): WhereCondition[] {
  const conditions: WhereCondition[] = [];

  if (filters.category) {
    conditions.push(eq(productGroups.category, filters.category));
  }

  if (filters.brand) {
    conditions.push(eq(productGroups.brand, filters.brand));
  }

  if (filters.search) {
    const searchTerm = `%${filters.search.toLowerCase()}%`;
    conditions.push(ilike(productGroups.name, searchTerm));
  }

  return conditions;
}

// Filters based on user role permissions (isActive visibility)
function createRoleBasedFilters(
  filters: ProductFilters,
  role: UserRole
): WhereCondition[] {
  const conditions: WhereCondition[] = [];

  if (typeof filters.isActive === "boolean") {
    const activeValue = hasPermission(role, PERMISSIONS, "canViewInactive")
      ? filters.isActive
      : true;
    conditions.push(eq(productGroups.isActive, activeValue));
  } else {
    if (!hasPermission(role, PERMISSIONS, "canViewInactive")) {
      conditions.push(eq(productGroups.isActive, true));
    }
  }

  return conditions;
}

function createVariantFilters(
  groupIds: string[],
  role: UserRole
): WhereCondition[] {
  const conditions: WhereCondition[] = [
    inArray(productVariants.productGroupId, groupIds),
  ];

  if (!hasPermission(role, PERMISSIONS, "canViewInactive")) {
    conditions.push(eq(productVariants.isActive, true));
  }

  return conditions;
}

function createProductFilters(
  groupIds: string[],
  role: UserRole
): WhereCondition[] {
  const conditions: WhereCondition[] = [
    inArray(products.productGroupId, groupIds),
  ];

  if (!hasPermission(role, PERMISSIONS, "canViewInactive")) {
    conditions.push(eq(products.isActive, true));
  }

  return conditions;
}

// === Database Queries ===
async function getProductGroups(
  conditions: WhereCondition[]
): Promise<SelectProductGroup[]> {
  const validConditions = conditions.filter(
    (c): c is SQL<unknown> => c !== undefined
  );

  if (validConditions.length === 0) {
    return await db.select().from(productGroups);
  }

  return await db
    .select()
    .from(productGroups)
    .where(and(...validConditions));
}

async function getVariants(
  conditions: WhereCondition[]
): Promise<SelectProductVariant[]> {
  const validConditions = conditions.filter(
    (c): c is SQL<unknown> => c !== undefined
  );

  if (validConditions.length === 0) return [];

  return await db
    .select()
    .from(productVariants)
    .where(and(...validConditions));
}

async function getProductsList(
  conditions: WhereCondition[]
): Promise<SelectProduct[]> {
  const validConditions = conditions.filter(
    (c): c is SQL<unknown> => c !== undefined
  );

  if (validConditions.length === 0) return [];

  return await db
    .select()
    .from(products)
    .where(and(...validConditions));
}

async function getVariantCombinations(productIds: string[]) {
  if (productIds.length === 0) return [];

  return await db
    .select()
    .from(productVariantCombinations)
    .where(inArray(productVariantCombinations.productId, productIds));
}

// === Data Grouping Utilities ===
function groupBy<T extends { id: string }>(
  items: T[],
  getKey: (item: T) => string
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const key = getKey(item);
    const existing = grouped.get(key) ?? [];
    grouped.set(key, [...existing, item]);
  }

  return grouped;
}

function createVariantSelections(
  combinations: Array<{ productId: string; variantId: string }>,
  variants: SelectProductVariant[]
): Map<string, VariantSelection> {
  const variantsMap = new Map(variants.map((v) => [v.id, v]));
  const selectionsMap = new Map<string, VariantSelection>();

  for (const combo of combinations) {
    const variant = variantsMap.get(combo.variantId);
    if (!variant) continue;

    const selections = selectionsMap.get(combo.productId) ?? {};
    selections[variant.variant] = variant.value;
    selectionsMap.set(combo.productId, selections);
  }

  return selectionsMap;
}

// === Main Assembly ===
function assembleCompleteProducts(
  groups: SelectProductGroup[],
  variantsByGroup: Map<string, SelectProductVariant[]>,
  productsByGroup: Map<string, SelectProduct[]>,
  variantSelections: Map<string, VariantSelection>
): CompleteProduct[] {
  return groups.map((group) => {
    const groupProducts = productsByGroup.get(group.id) ?? [];

    return {
      productGroup: group,
      variants: variantsByGroup.get(group.id) ?? [],
      products: groupProducts,
      variantSelectionsByProductId: Object.fromEntries(
        groupProducts.map((p) => [p.id, variantSelections.get(p.id) ?? {}])
      ),
    };
  });
}

// === Main Service ===
export const productService = {
  async getProductGroups(
    filters: ProductFilters,
    viewerRole: UserRole
  ): Promise<CompleteProduct[]> {
    // Step 1: Apply user input filters (search, category, brand)
    const userInputFilters = createUserInputFilters(filters);

    // Step 2: Apply role-based filters (isActive visibility based on permissions)
    const roleBasedFilters = createRoleBasedFilters(filters, viewerRole);

    // Step 3: Combine all filters
    const finalFilters = [...userInputFilters, ...roleBasedFilters];

    // Step 4: Fetch product groups with combined filters
    const productGroups = await getProductGroups(finalFilters);
    if (productGroups.length === 0) return [];

    // Step 5: Extract group IDs for subsequent queries
    const groupIds = productGroups.map((g) => g.id);

    // Step 6: Build filters for variants and products (with role-based restrictions)
    const variantFilters = createVariantFilters(groupIds, viewerRole);
    const productFilters = createProductFilters(groupIds, viewerRole);

    // Step 7: Fetch variants and products in parallel
    const [variants, productsList] = await Promise.all([
      getVariants(variantFilters),
      getProductsList(productFilters),
    ]);

    // Step 8: Group data by product group ID
    const variantsByGroup = groupBy(variants, (v) => v.productGroupId);
    const productsByGroup = groupBy(productsList, (p) => p.productGroupId);

    // Step 9: Fetch variant combinations
    const productIds = productsList.map((p) => p.id);
    const combinations = await getVariantCombinations(productIds);

    // Step 10: Create variant selections map
    const variantSelections = createVariantSelections(combinations, variants);

    // Step 11: Assemble final result
    return assembleCompleteProducts(
      productGroups,
      variantsByGroup,
      productsByGroup,
      variantSelections
    );
  },
};
