import { z } from "zod";
import { ProductStatus, VariantAttributeType } from "../generated/prisma/enums";

// Product schemas
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must be less than 200 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
  description: z.string().optional(),
  shortDescription: z
    .string()
    .max(500, "Short description must be less than 500 characters")
    .optional(),
  brandId: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  basePrice: z
    .number()
    .positive("Base price must be positive")
    .max(999999.99, "Base price too large"),
  status: z.nativeEnum(ProductStatus).optional().default(ProductStatus.ACTIVE),
  featured: z.boolean().optional().default(false),
  metaTitle: z.string().max(60, "Meta title must be less than 60 characters").optional(),
  metaDescription: z.string().max(160, "Meta description must be less than 160 characters").optional(),
  fabricFit: z.string().optional(),
  careInstructions: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must be less than 200 characters")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only")
    .optional(),
  description: z.string().optional(),
  shortDescription: z
    .string()
    .max(500, "Short description must be less than 500 characters")
    .optional(),
  brandId: z.string().min(1, "Brand is required").optional(),
  categoryId: z.string().min(1, "Category is required").optional(),
  basePrice: z
    .number()
    .positive("Base price must be positive")
    .max(999999.99, "Base price too large")
    .optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  featured: z.boolean().optional(),
  metaTitle: z.string().max(60, "Meta title must be less than 60 characters").optional(),
  metaDescription: z.string().max(160, "Meta description must be less than 160 characters").optional(),
  fabricFit: z.string().optional(),
  careInstructions: z.string().optional(),
});

export const productFiltersSchema = z.object({
  status: z.nativeEnum(ProductStatus).optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  featured: z.boolean().optional(),
  search: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
});

export const productPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["name", "basePrice", "status", "featured", "createdAt", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Product Variant schemas
export const createVariantSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50, "SKU must be less than 50 characters"),
  name: z
    .string()
    .min(1, "Variant name is required")
    .max(200, "Variant name must be less than 200 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
  price: z
    .number()
    .positive("Price must be positive")
    .max(999999.99, "Price too large"),
  compareAtPrice: z
    .number()
    .positive("Compare at price must be positive")
    .max(999999.99, "Compare at price too large")
    .optional(),
  costPrice: z
    .number()
    .positive("Cost price must be positive")
    .max(999999.99, "Cost price too large")
    .optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
  lowStockThreshold: z.number().int().min(0, "Low stock threshold cannot be negative").default(5),
  trackInventory: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export const updateVariantSchema = z.object({
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50, "SKU must be less than 50 characters")
    .optional(),
  name: z
    .string()
    .min(1, "Variant name is required")
    .max(200, "Variant name must be less than 200 characters")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only")
    .optional(),
  price: z
    .number()
    .positive("Price must be positive")
    .max(999999.99, "Price too large")
    .optional(),
  compareAtPrice: z
    .number()
    .positive("Compare at price must be positive")
    .max(999999.99, "Compare at price too large")
    .optional(),
  costPrice: z
    .number()
    .positive("Cost price must be positive")
    .max(999999.99, "Cost price too large")
    .optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  lowStockThreshold: z.number().int().min(0, "Low stock threshold cannot be negative").optional(),
  trackInventory: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

// Variant Attribute schemas
export const createVariantAttributeSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  type: z.nativeEnum(VariantAttributeType),
  name: z
    .string()
    .min(1, "Attribute name is required")
    .max(100, "Attribute name must be less than 100 characters"),
  value: z
    .string()
    .min(1, "Attribute value is required")
    .max(200, "Attribute value must be less than 200 characters"),
  hexColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid hex color format")
    .optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateVariantAttributeSchema = z.object({
  type: z.nativeEnum(VariantAttributeType).optional(),
  name: z
    .string()
    .min(1, "Attribute name is required")
    .max(100, "Attribute name must be less than 100 characters")
    .optional(),
  value: z
    .string()
    .min(1, "Attribute value is required")
    .max(200, "Attribute value must be less than 200 characters")
    .optional(),
  hexColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid hex color format")
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// Product Image schemas
export const createProductImageSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  url: z.string().url("Invalid image URL"),
  altText: z
    .string()
    .min(1, "Alt text is required")
    .max(200, "Alt text must be less than 200 characters"),
  sortOrder: z.number().int().min(0).default(0),
  isMain: z.boolean().default(false),
}).refine(
  (data) => data.productId || data.variantId,
  {
    message: "Either productId or variantId must be provided",
    path: ["productId"],
  }
);

export const updateProductImageSchema = z.object({
  url: z.string().url("Invalid image URL").optional(),
  altText: z
    .string()
    .min(1, "Alt text is required")
    .max(200, "Alt text must be less than 200 characters")
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
  isMain: z.boolean().optional(),
});

// Product Specification schemas
export const createProductSpecificationSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z
    .string()
    .min(1, "Specification name is required")
    .max(100, "Specification name must be less than 100 characters"),
  value: z
    .string()
    .min(1, "Specification value is required")
    .max(500, "Specification value must be less than 500 characters"),
  iconUrl: z.string().url("Invalid icon URL").optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateProductSpecificationSchema = z.object({
  name: z
    .string()
    .min(1, "Specification name is required")
    .max(100, "Specification name must be less than 100 characters")
    .optional(),
  value: z
    .string()
    .min(1, "Specification value is required")
    .max(500, "Specification value must be less than 500 characters")
    .optional(),
  iconUrl: z.string().url("Invalid icon URL").optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// Category schemas
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only")
    .optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

// Brand schemas
export const createBrandSchema = z.object({
  name: z
    .string()
    .min(1, "Brand name is required")
    .max(100, "Brand name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
  description: z.string().optional(),
  logoUrl: z.string().url("Invalid logo URL").optional(),
  website: z.string().url("Invalid website URL").optional(),
});

export const updateBrandSchema = z.object({
  name: z
    .string()
    .min(1, "Brand name is required")
    .max(100, "Brand name must be less than 100 characters")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only")
    .optional(),
  description: z.string().optional(),
  logoUrl: z.string().url("Invalid logo URL").optional(),
  website: z.string().url("Invalid website URL").optional(),
});

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilters = z.infer<typeof productFiltersSchema>;
export type ProductPaginationOptions = z.infer<typeof productPaginationSchema>;

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;

export type CreateVariantAttributeInput = z.infer<typeof createVariantAttributeSchema>;
export type UpdateVariantAttributeInput = z.infer<typeof updateVariantAttributeSchema>;

export type CreateProductImageInput = z.infer<typeof createProductImageSchema>;
export type UpdateProductImageInput = z.infer<typeof updateProductImageSchema>;

export type CreateProductSpecificationInput = z.infer<typeof createProductSpecificationSchema>;
export type UpdateProductSpecificationInput = z.infer<typeof updateProductSpecificationSchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;