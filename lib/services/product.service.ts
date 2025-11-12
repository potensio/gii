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

// === Service Layer Types ===

export interface CreateProductData {
  name: string;
  category: string;
  brand: string;
  description?: string;
  weight?: number;
  isActive: boolean;
  isHighlighted?: boolean;
  additionalDescriptions?: Array<{ title: string; body: string }>;
  images?: Array<{ url: string; isThumbnail: boolean }>;
  hasVariants: boolean;
  variantTypes: string[];
  combinations: Array<{
    variants: Record<string, string>;
    sku: string;
    name?: string;
    price: number;
    stock: number;
    active: boolean;
  }>;
}

export type UpdateProductData = CreateProductData;

export interface CompleteProductResult {
  productGroup: SelectProductGroup;
  products: SelectProduct[];
}

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
  groups: Array<
    SelectProductGroup & {
      images?: Array<{ url: string; isThumbnail: boolean }>;
    }
  >,
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
    const fetchedProductGroups = await getProductGroups(finalFilters);
    if (fetchedProductGroups.length === 0) return [];

    // Step 4.5: Parse additional descriptions and images from JSON
    const parsedProductGroups = fetchedProductGroups.map((group) => {
      const parsed = {
        ...group,
        additionalDescriptions: group.additionalDescriptions
          ? JSON.parse(group.additionalDescriptions)
          : [],
      };

      // Parse images and override the type
      const images: Array<{ url: string; isThumbnail: boolean }> | undefined =
        group.images ? JSON.parse(group.images) : undefined;

      return {
        ...parsed,
        images,
      };
    });

    // Step 5: Extract group IDs for subsequent queries
    const groupIds = parsedProductGroups.map((g) => g.id);

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
      parsedProductGroups as Array<
        SelectProductGroup & {
          images?: Array<{ url: string; isThumbnail: boolean }>;
        }
      >,
      variantsByGroup,
      productsByGroup,
      variantSelections
    );
  },

  async createProductGroup(data: {
    name: string;
    category: string;
    brand: string;
    description?: string;
    weight?: number;
    isActive: boolean;
    isHighlighted?: boolean;
    additionalDescriptions?: Array<{ title: string; body: string }>;
    images?: Array<{ url: string; isThumbnail: boolean }>;
  }): Promise<SelectProductGroup> {
    try {
      const additionalDescriptionsJson =
        data.additionalDescriptions && data.additionalDescriptions.length > 0
          ? JSON.stringify(data.additionalDescriptions)
          : null;

      const imagesJson =
        data.images && data.images.length > 0
          ? JSON.stringify(data.images)
          : null;

      const [productGroup] = await db
        .insert(productGroups)
        .values({
          name: data.name,
          category: data.category,
          brand: data.brand,
          description: data.description,
          weight: data.weight,
          isActive: data.isActive,
          isHighlighted: data.isHighlighted ?? false,
          additionalDescriptions: additionalDescriptionsJson,
          images: imagesJson,
        })
        .returning();

      return productGroup;
    } catch (error) {
      console.error("Error creating product group:", error);
      throw new Error(
        `Gagal membuat grup produk: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  async updateProductGroup(
    id: string,
    data: Partial<{
      name: string;
      category: string;
      brand: string;
      description?: string;
      weight?: number;
      isActive: boolean;
      isHighlighted?: boolean;
      additionalDescriptions?: Array<{ title: string; body: string }>;
      images?: Array<{ url: string; isThumbnail: boolean }>;
    }>
  ): Promise<SelectProductGroup> {
    try {
      const updateData: Partial<typeof productGroups.$inferInsert> = {};

      // Copy all fields except additionalDescriptions and images
      if (data.name !== undefined) updateData.name = data.name;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.brand !== undefined) updateData.brand = data.brand;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.weight !== undefined) updateData.weight = data.weight;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.isHighlighted !== undefined)
        updateData.isHighlighted = data.isHighlighted;

      // Handle additionalDescriptions conversion to JSON
      if (data.additionalDescriptions !== undefined) {
        updateData.additionalDescriptions =
          data.additionalDescriptions.length > 0
            ? JSON.stringify(data.additionalDescriptions)
            : null;
      }

      // Handle images conversion to JSON
      if (data.images !== undefined) {
        updateData.images =
          data.images.length > 0 ? JSON.stringify(data.images) : null;
      }

      const [updated] = await db
        .update(productGroups)
        .set(updateData)
        .where(eq(productGroups.id, id))
        .returning();

      if (!updated) {
        throw new Error("Product group not found");
      }

      return updated;
    } catch (error) {
      console.error("Error updating product group:", error);
      throw new Error(
        `Gagal memperbarui grup produk: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  async createCompleteProduct(
    data: CreateProductData
  ): Promise<CompleteProductResult> {
    try {
      return await db.transaction(async (tx) => {
        // Step 1: Create product group
        const [productGroup] = await tx
          .insert(productGroups)
          .values({
            name: data.name,
            category: data.category,
            brand: data.brand,
            description: data.description,
            weight: data.weight,
            isActive: data.isActive,
            isHighlighted: data.isHighlighted ?? false,
            additionalDescriptions:
              data.additionalDescriptions &&
              data.additionalDescriptions.length > 0
                ? JSON.stringify(data.additionalDescriptions)
                : null,
            images:
              data.images && data.images.length > 0
                ? JSON.stringify(data.images)
                : null,
          })
          .returning();

        // Step 2: Create variants if hasVariants
        const createdVariants: Map<string, Map<string, string>> = new Map();

        if (data.hasVariants && data.variantTypes.length > 0) {
          // Collect unique variant values for each type
          const variantValuesByType = new Map<string, Set<string>>();

          for (const combination of data.combinations) {
            for (const [variantType, variantValue] of Object.entries(
              combination.variants
            )) {
              if (!variantValuesByType.has(variantType)) {
                variantValuesByType.set(variantType, new Set());
              }
              variantValuesByType.get(variantType)!.add(variantValue);
            }
          }

          // Create variant records
          for (const [variantType, values] of variantValuesByType.entries()) {
            const typeMap = new Map<string, string>();

            for (const value of values) {
              const [variant] = await tx
                .insert(productVariants)
                .values({
                  productGroupId: productGroup.id,
                  variant: variantType,
                  value: value,
                  isActive: true,
                })
                .returning();

              typeMap.set(value, variant.id);
            }

            createdVariants.set(variantType, typeMap);
          }
        }

        // Step 3: Create products (combinations)
        const createdProducts = [];

        for (const combination of data.combinations) {
          const productName =
            combination.name && combination.name.trim() !== ""
              ? combination.name
              : data.name;

          const [product] = await tx
            .insert(products)
            .values({
              productGroupId: productGroup.id,
              sku: combination.sku,
              name: productName,
              price: combination.price,
              stock: combination.stock,
              isActive: combination.active,
            })
            .returning();

          createdProducts.push(product);

          // Step 4: Create variant combinations if variants exist
          if (
            data.hasVariants &&
            Object.keys(combination.variants).length > 0
          ) {
            for (const [variantType, variantValue] of Object.entries(
              combination.variants
            )) {
              const variantId = createdVariants
                .get(variantType)
                ?.get(variantValue);

              if (variantId) {
                await tx.insert(productVariantCombinations).values({
                  productId: product.id,
                  variantId: variantId,
                });
              }
            }
          }
        }

        return {
          productGroup,
          products: createdProducts,
        };
      });
    } catch (error) {
      console.error("Error creating complete product:", error);
      throw new Error(
        `Gagal membuat produk lengkap: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  async updateCompleteProduct(
    id: string,
    data: UpdateProductData
  ): Promise<CompleteProductResult> {
    try {
      return await db.transaction(async (tx) => {
        // Step 1: Update product group
        const [productGroup] = await tx
          .update(productGroups)
          .set({
            name: data.name,
            category: data.category,
            brand: data.brand,
            description: data.description,
            weight: data.weight,
            isActive: data.isActive,
            isHighlighted: data.isHighlighted ?? false,
            additionalDescriptions:
              data.additionalDescriptions &&
              data.additionalDescriptions.length > 0
                ? JSON.stringify(data.additionalDescriptions)
                : null,
            images:
              data.images && data.images.length > 0
                ? JSON.stringify(data.images)
                : null,
            updatedAt: new Date(),
          })
          .where(eq(productGroups.id, id))
          .returning();

        if (!productGroup) {
          throw new Error("Product group not found");
        }

        // Step 2: Delete existing data
        // Get existing products first
        const existingProducts = await tx
          .select()
          .from(products)
          .where(eq(products.productGroupId, id));

        const existingProductIds = existingProducts.map((p) => p.id);

        if (existingProductIds.length > 0) {
          // Delete variant combinations
          await tx
            .delete(productVariantCombinations)
            .where(
              inArray(productVariantCombinations.productId, existingProductIds)
            );
        }

        // Delete products
        await tx.delete(products).where(eq(products.productGroupId, id));

        // Delete variants
        await tx
          .delete(productVariants)
          .where(eq(productVariants.productGroupId, id));

        // Step 3: Recreate variants if hasVariants
        const createdVariants: Map<string, Map<string, string>> = new Map();

        if (data.hasVariants && data.variantTypes.length > 0) {
          // Collect unique variant values for each type
          const variantValuesByType = new Map<string, Set<string>>();

          for (const combination of data.combinations) {
            for (const [variantType, variantValue] of Object.entries(
              combination.variants
            )) {
              if (!variantValuesByType.has(variantType)) {
                variantValuesByType.set(variantType, new Set());
              }
              variantValuesByType.get(variantType)!.add(variantValue);
            }
          }

          // Create variant records
          for (const [variantType, values] of variantValuesByType.entries()) {
            const typeMap = new Map<string, string>();

            for (const value of values) {
              const [variant] = await tx
                .insert(productVariants)
                .values({
                  productGroupId: id,
                  variant: variantType,
                  value: value,
                  isActive: true,
                })
                .returning();

              typeMap.set(value, variant.id);
            }

            createdVariants.set(variantType, typeMap);
          }
        }

        // Step 4: Recreate products (combinations)
        const createdProducts = [];

        for (const combination of data.combinations) {
          const productName =
            combination.name && combination.name.trim() !== ""
              ? combination.name
              : data.name;

          const [product] = await tx
            .insert(products)
            .values({
              productGroupId: id,
              sku: combination.sku,
              name: productName,
              price: combination.price,
              stock: combination.stock,
              isActive: combination.active,
            })
            .returning();

          createdProducts.push(product);

          // Step 5: Recreate variant combinations if variants exist
          if (
            data.hasVariants &&
            Object.keys(combination.variants).length > 0
          ) {
            for (const [variantType, variantValue] of Object.entries(
              combination.variants
            )) {
              const variantId = createdVariants
                .get(variantType)
                ?.get(variantValue);

              if (variantId) {
                await tx.insert(productVariantCombinations).values({
                  productId: product.id,
                  variantId: variantId,
                });
              }
            }
          }
        }

        return {
          productGroup,
          products: createdProducts,
        };
      });
    } catch (error) {
      console.error("Error updating complete product:", error);
      throw new Error(
        `Gagal memperbarui produk lengkap: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
};
