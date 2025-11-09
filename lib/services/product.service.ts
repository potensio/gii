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

type WhereCondition = SQL<unknown> | undefined;
type VariantSelection = Record<string, string>;

// === Permission Configuration ===
const PERMISSIONS = {
  user: { canViewInactive: false },
  admin: { canViewInactive: true },
  super_admin: { canViewInactive: true },
} as const;

function canViewInactive(role?: UserRole): boolean {
  return role ? (PERMISSIONS[role]?.canViewInactive ?? false) : false;
}

// === Query Filter Builders ===
function createProductGroupFilters(
  filters: ProductFilters,
  role: UserRole
): WhereCondition[] {
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

  if (typeof filters.isActive === "boolean") {
    const activeValue = canViewInactive(role) ? filters.isActive : true;
    conditions.push(eq(productGroups.isActive, activeValue));
  } else {
    if (!canViewInactive(role)) {
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

  if (!canViewInactive(role)) {
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

  if (!canViewInactive(role)) {
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
    // Build filter conditions for product groups based on user role and input filters
    const groupFilters = createProductGroupFilters(filters, viewerRole);
    // Fetch product groups that match the filter conditions
    const productGroups = await getProductGroups(groupFilters);
    // Early return if no productGroups found
    if (productGroups.length === 0) return [];
    // Extract group IDs for subsequent queries
    const groupIds = productGroups.map((g) => g.id);
    // Build filter conditions for variants based on group IDs and user role
    const variantFilters = createVariantFilters(groupIds, viewerRole);
    // Build filter conditions for products based on group IDs and user role
    const productFilters = createProductFilters(groupIds, viewerRole);
    // Fetch variants and products in parallel for performance
    const [variants, productsList] = await Promise.all([
      getVariants(variantFilters),
      getProductsList(productFilters),
    ]);
    // Group variants by their product group ID for easier processing
    const variantsByGroup = groupBy(variants, (v) => v.productGroupId);
    // Group products by their product group ID for easier processing
    const productsByGroup = groupBy(productsList, (p) => p.productGroupId);
    // Extract product IDs for variant combination lookup
    const productIds = productsList.map((p) => p.id);
    // Fetch variant combinations for all products
    const combinations = await getVariantCombinations(productIds);
    // Create variant selections map for each product
    const variantSelections = createVariantSelections(combinations, variants);
    // Assemble complete product data structure with all related entities
    return assembleCompleteProducts(
      productGroups,
      variantsByGroup,
      productsByGroup,
      variantSelections
    );
  },
};
