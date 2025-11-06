import { db } from "../db/db";
import { and, eq, inArray, ilike, type SQL } from "drizzle-orm";
import {
  productGroups,
  productVariants,
  products,
  type SelectProductGroup,
  type SelectProductVariant,
  type SelectProduct,
} from "../db/schema";
import { CompleteProduct, ProductFilters } from "@/hooks/use-products";

export type UserRole = "user" | "admin" | "super_admin";
type WhereCondition = SQL<unknown> | undefined;

// ==================== Constants ====================
const ROLE_PERMISSIONS = {
  user: {
    canViewInactive: false,
  },
  admin: {
    canViewInactive: true,
  },
  super_admin: {
    canViewInactive: true,
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
    if (!canViewInactiveItems(viewerRole)) {
      filters.isActive = true;
    } else {
      conditions.push(eq(productGroups.isActive, filters.isActive));
    }
  }

  if (filters.search) {
    const searchPattern = `%${filters.search.toLowerCase()}%`;
    conditions.push(ilike(productGroups.name, searchPattern));
  }

  return conditions;
}

function buildVariantFilters(groupIds: string[]): WhereCondition[] {
  const conditions: WhereCondition[] = [
    inArray(productVariants.productGroupId, groupIds),
  ];

  return conditions;
}

function buildProductFilters(groupIds: string[]): WhereCondition[] {
  const conditions: WhereCondition[] = [
    inArray(products.productGroupId, groupIds),
  ];

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

// ==================== Data Grouping ====================
function groupVariantsByProductGroup(
  variants: SelectProductVariant[]
): Map<string, SelectProductVariant[]> {
  const grouped = new Map<string, SelectProductVariant[]>();

  for (const variant of variants) {
    const existingVariants = grouped.get(variant.productGroupId) ?? [];
    existingVariants.push(variant);
    grouped.set(variant.productGroupId, existingVariants);
  }

  return grouped;
}

function groupProductsByProductGroup(
  products: SelectProduct[]
): Map<string, SelectProduct[]> {
  const grouped = new Map<string, SelectProduct[]>();

  for (const product of products) {
    const existingProducts = grouped.get(product.productGroupId) ?? [];
    existingProducts.push(product);
    grouped.set(product.productGroupId, existingProducts);
  }

  return grouped;
}

// ==================== Result Builder ====================
function buildCompleteProducts(
  groups: SelectProductGroup[],
  variantsByGroup: Map<string, SelectProductVariant[]>,
  productsByGroup: Map<string, SelectProduct[]>
): CompleteProduct[] {
  return groups.map((group) => ({
    productGroup: group,
    variants: variantsByGroup.get(group.id) ?? [],
    products: productsByGroup.get(group.id) ?? [],
  }));
}

// ==================== Main Service ====================
export const productService = {
  /**
   * Fetch products with optional filters and role-based access control
   * @param filters - Optional filters for category, brand, search, etc.
   * @returns Array of complete products with their variants and products
   * @throws Error if validation fails or database query fails
   */
  async getProducts(
    filters: ProductFilters,
    viewerRole: UserRole
  ): Promise<CompleteProduct[]> {
    try {
      // 2. Build and execute product groups query
      const groupConditions = buildProductGroupFilters(filters, viewerRole);
      const groups = await fetchProductGroups(groupConditions);

      // Early return if no groups found
      if (groups.length === 0) {
        return [];
      }

      // 3. Extract group IDs for child queries
      const groupIds = groups.map((group) => group.id);

      // 4. Build conditions for variants and products
      const variantConditions = buildVariantFilters(groupIds);
      const productConditions = buildProductFilters(groupIds);

      // 5. Fetch variants and products in parallel
      const [variantRows, productRows] = await Promise.all([
        fetchVariants(variantConditions),
        fetchProducts(productConditions),
      ]);

      // 6. Group variants and products by their product group ID
      const variantsByGroup = groupVariantsByProductGroup(variantRows);
      const productsByGroup = groupProductsByProductGroup(productRows);

      // 7. Build and return complete products
      return buildCompleteProducts(groups, variantsByGroup, productsByGroup);
    } catch (error) {
      // Re-throw with context if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      // Wrap unknown errors
      throw new Error("Failed to fetch products: Unknown error occurred");
    }
  },

  //   async getProductById(
  //     groupId: string,
  //     viewerRole?: UserRole
  //   ): Promise<CompleteProduct | null> {
  //     try {
  //       const results = await this.getProducts({
  //         viewerRole,
  //         includeInactiveChildren: canViewInactiveItems(viewerRole),
  //       });

  //       return results.find((p) => p.productGroup.id === groupId) ?? null;
  //     } catch (error) {
  //       throw new Error(
  //         `Failed to fetch product by ID: ${error instanceof Error ? error.message : "Unknown error"}`
  //       );
  //     }
  //   },
};

// Export convenience function
export const getProducts = productService.getProducts;
