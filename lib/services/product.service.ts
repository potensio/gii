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

// ==================== Constants ====================
const ROLE_PERMISSIONS = {
  user: {
    canViewInactive: false,
    canEdit: false,
  },
  admin: {
    canViewInactive: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  },
  super_admin: {
    canViewInactive: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  },
} as const;

// ==================== Role Access Helpers ====================
function canViewInactiveItems(role?: UserRole): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.canViewInactive ?? false;
}

// ==================== Query Builders ====================
function buildProductGroupFilters(
  filters: ProductFilters,
  viewerRole: UserRole
): WhereCondition[] {
  const conditions: WhereCondition[] = [];

  if (filters.category) {
    conditions.push(eq(productGroups.category, filters.category));
  }

  if (filters.brand) {
    conditions.push(eq(productGroups.brand, filters.brand));
  }

  if (typeof filters.isActive === "boolean") {
    const activeStatus = !canViewInactiveItems(viewerRole)
      ? true
      : filters.isActive;
    conditions.push(eq(productGroups.isActive, activeStatus));
  } else if (!canViewInactiveItems(viewerRole)) {
    conditions.push(eq(productGroups.isActive, true));
  }

  if (filters.search) {
    const searchPattern = `%${filters.search.toLowerCase()}%`;
    conditions.push(ilike(productGroups.name, searchPattern));
  }

  return conditions;
}

function buildVariantFilters(
  groupIds: string[],
  viewerRole: UserRole
): WhereCondition[] {
  const conditions: WhereCondition[] = [
    inArray(productVariants.productGroupId, groupIds),
  ];

  if (!canViewInactiveItems(viewerRole)) {
    conditions.push(eq(productVariants.isActive, true));
  }

  return conditions;
}

function buildProductFilters(
  groupIds: string[],
  viewerRole: UserRole
): WhereCondition[] {
  const conditions: WhereCondition[] = [
    inArray(products.productGroupId, groupIds),
  ];

  if (!canViewInactiveItems(viewerRole)) {
    conditions.push(eq(products.isActive, true));
  }

  return conditions;
}

// ==================== Database Queries ====================
async function fetchProductGroups(
  conditions: WhereCondition[]
): Promise<SelectProductGroup[]> {
  try {
    if (conditions.length === 0) {
      return await db.select().from(productGroups);
    }

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
  } catch (error) {
    throw new Error(
      `Failed to fetch product groups: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

async function fetchVariants(
  conditions: WhereCondition[]
): Promise<SelectProductVariant[]> {
  try {
    const validConditions = conditions.filter(
      (c): c is SQL<unknown> => c !== undefined
    );

    if (validConditions.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(productVariants)
      .where(and(...validConditions));
  } catch (error) {
    throw new Error(
      `Failed to fetch variants: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

async function fetchProducts(
  conditions: WhereCondition[]
): Promise<SelectProduct[]> {
  try {
    const validConditions = conditions.filter(
      (c): c is SQL<unknown> => c !== undefined
    );

    if (validConditions.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(products)
      .where(and(...validConditions));
  } catch (error) {
    throw new Error(
      `Failed to fetch products: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

async function fetchProductVariantCombinationsForProducts(
  productIds: string[]
) {
  try {
    if (productIds.length === 0)
      return [] as { productId: string; variantId: string }[];

    return await db
      .select()
      .from(productVariantCombinations)
      .where(inArray(productVariantCombinations.productId, productIds));
  } catch (error) {
    throw new Error(
      `Failed to fetch product variant combinations: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// ==================== Data Grouping ====================
// Function to group product variants by product group ID
function groupVariantsByProductGroup(
  variants: SelectProductVariant[]
): Map<string, SelectProductVariant[]> {
  // Define a map to store product variants grouped by product group ID
  const grouped = new Map<string, SelectProductVariant[]>();

  // Group product variants by product group ID
  for (const variant of variants) {
    const existingVariants = grouped.get(variant.productGroupId) ?? [];
    existingVariants.push(variant);
    grouped.set(variant.productGroupId, existingVariants);
  }

  return grouped;
}

// Function to group products by product group ID
function groupProductsByProductGroup(
  products: SelectProduct[]
): Map<string, SelectProduct[]> {
  // Define a map to store products grouped by product group ID
  const grouped = new Map<string, SelectProduct[]>();

  // Group products by product group ID
  for (const product of products) {
    const existingProducts = grouped.get(product.productGroupId) ?? [];
    existingProducts.push(product);
    grouped.set(product.productGroupId, existingProducts);
  }

  return grouped;
}

// ==================== Result Builder ====================
// Function to build complete products with grouped variants and products
function buildCompleteProducts(
  groups: SelectProductGroup[],
  variantsByGroup: Map<string, SelectProductVariant[]>,
  productsByGroup: Map<string, SelectProduct[]>,
  variantSelectionsByProductIdMap: Map<string, Record<string, string>>
): CompleteProduct[] {
  // Map each product group to a complete product object
  return groups.map((group) => ({
    productGroup: group,
    variants: variantsByGroup.get(group.id) ?? [],
    products: productsByGroup.get(group.id) ?? [],
    variantSelectionsByProductId: Object.fromEntries(
      (productsByGroup.get(group.id) ?? []).map((p) => [
        p.id,
        variantSelectionsByProductIdMap.get(p.id) ?? {},
      ])
    ),
  }));
}

// ==================== Main Service ====================
export const productService = {
  async getProducts(
    filters: ProductFilters,
    viewerRole: UserRole
  ): Promise<CompleteProduct[]> {
    try {
      // Build and execute product groups query
      const groupConditions = buildProductGroupFilters(filters, viewerRole);
      const groups = await fetchProductGroups(groupConditions);

      // Early return if no groups found
      if (groups.length === 0) {
        return [];
      }

      // Extract group IDs for child queries
      const groupIds = groups.map((group) => group.id);

      // Build conditions for variants and products
      const variantConditions = buildVariantFilters(groupIds, viewerRole);
      const productConditions = buildProductFilters(groupIds, viewerRole);

      // Fetch variants and products in parallel
      const [variantRows, productRows] = await Promise.all([
        fetchVariants(variantConditions),
        fetchProducts(productConditions),
      ]);

      // Group variants and products by their product group ID
      const variantsByGroup = groupVariantsByProductGroup(variantRows);
      const productsByGroup = groupProductsByProductGroup(productRows);

      // Fetch product-variant combinations and build per-product selections mapping
      const productIds = productRows.map((p) => p.id);
      const comboRows =
        await fetchProductVariantCombinationsForProducts(productIds);

      // Build variant selection map per product ID
      const variantsById = new Map(variantRows.map((v) => [v.id, v]));
      const selectionsByProductId = new Map<string, Record<string, string>>();
      for (const combo of comboRows) {
        const variant = variantsById.get(combo.variantId);
        if (!variant) continue;
        const existing = selectionsByProductId.get(combo.productId) ?? {};
        existing[variant.variant] = variant.value;
        selectionsByProductId.set(combo.productId, existing);
      }

      // Build and return complete products including selections map
      return buildCompleteProducts(
        groups,
        variantsByGroup,
        productsByGroup,
        selectionsByProductId
      );
    } catch (error) {
      // Re-throw with context if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      // Wrap unknown errors
      throw new Error("Failed to fetch products: Unknown error occurred");
    }
  },
};

// Export convenience function
export const getProducts = productService.getProducts;
