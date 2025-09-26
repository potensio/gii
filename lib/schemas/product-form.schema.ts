import { z } from "zod";
import { ProductStatus, VariantAttributeType } from "../generated/prisma/enums";

// Sub-description schema for form
export const subDescriptionSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .min(1, "Sub-description title is required")
    .max(100, "Title must be less than 100 characters"),
  content: z
    .string()
    .min(1, "Sub-description content is required")
    .max(1000, "Content must be less than 1000 characters"),
});

// Product image schema for form
export const productImageSchema = z.object({
  id: z.string(),
  file: z.instanceof(File, { message: "Invalid file" }),
  preview: z.string().url("Invalid preview URL"),
  isThumbnail: z.boolean().default(false),
});

// Variant attribute schema for form
export const variantAttributeSchema = z.object({
  type: z.nativeEnum(VariantAttributeType),
  name: z
    .string()
    .min(1, "Attribute name is required")
    .max(50, "Attribute name must be less than 50 characters"),
  value: z
    .string()
    .min(1, "Attribute value is required")
    .max(100, "Attribute value must be less than 100 characters"),
});

// Product variant schema for form
export const productVariantSchema = z.object({
  id: z.string(),
  attributes: z
    .array(variantAttributeSchema)
    .min(1, "At least one attribute is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Price must be a positive number")
    .refine((val) => {
      const num = parseFloat(val);
      return num <= 999999.99;
    }, "Price cannot exceed 999,999.99"),
  stock: z
    .string()
    .min(1, "Stock is required")
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    }, "Stock must be a non-negative integer")
    .refine((val) => {
      const num = parseInt(val);
      return num <= 999999;
    }, "Stock cannot exceed 999,999"),
});

// Uploaded image schema for API
export const uploadedImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  filename: z.string().min(1, "Filename is required"),
  originalName: z.string().min(1, "Original name is required"),
  size: z.number().positive("Size must be positive"),
  type: z.string().min(1, "Type is required"),
  isMain: z.boolean().default(false),
});

// Main product creation form schema
export const createProductFormSchema = z.object({
  // Basic product information
  productName: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must be less than 200 characters")
    .trim(),

  category: z.string().min(1, "Category is required"),

  brand: z.string().min(1, "Brand is required"),

  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50, "SKU must be less than 50 characters")
    .regex(
      /^[A-Z0-9-_]+$/,
      "SKU must contain only uppercase letters, numbers, hyphens, and underscores"
    ),

  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be less than 2000 characters"),

  basePrice: z
    .string()
    .min(1, "Base price is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Base price must be a positive number")
    .refine((val) => {
      const num = parseFloat(val);
      return num <= 999999.99;
    }, "Base price cannot exceed 999,999.99"),

  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),

  // SEO fields
  metaTitle: z
    .string()
    .max(60, "Meta title must be less than 60 characters")
    .optional()
    .or(z.literal("")),

  metaDescription: z
    .string()
    .max(160, "Meta description must be less than 160 characters")
    .optional()
    .or(z.literal("")),

  keywords: z
    .string()
    .max(500, "Keywords must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  // Sub-descriptions
  subDescriptions: z
    .array(subDescriptionSchema)
    .min(1, "At least one sub-description is required")
    .max(10, "Maximum 10 sub-descriptions allowed"),

  // Images (for form UI)
  images: z
    .array(productImageSchema)
    .min(1, "At least one product image is required")
    .max(20, "Maximum 20 images allowed")
    .refine(
      (images) => images.filter((img) => img.isThumbnail).length === 1,
      "Exactly one image must be set as thumbnail"
    ),

  // Uploaded images (for API processing)
  uploadedImages: z.array(uploadedImageSchema).optional(),

  // Variant attributes
  selectedAttributes: z
    .array(z.nativeEnum(VariantAttributeType))
    .min(1, "At least one variant attribute must be selected")
    .max(5, "Maximum 5 variant attributes allowed"),

  variants: z
    .array(productVariantSchema)
    .min(1, "At least one product variant is required")
    .max(50, "Maximum 50 variants allowed")
    .refine((variants) => {
      const combinations = variants.map((variant) =>
        variant.attributes
          .map((attr) => `${attr.type}:${attr.value}`)
          .sort()
          .join("|")
      );
      const uniqueCombinations = new Set(combinations);
      return uniqueCombinations.size === combinations.length;
    }, "Duplicate variant combinations are not allowed"),
});

// Additional validation schemas for specific sections
export const productInformationSchema = createProductFormSchema.pick({
  productName: true,
  category: true,
  brand: true,
  sku: true,
  description: true,
  basePrice: true,
  status: true,
});

export const seoSectionSchema = createProductFormSchema.pick({
  metaTitle: true,
  metaDescription: true,
  keywords: true,
});

export const subDescriptionsSectionSchema = createProductFormSchema.pick({
  subDescriptions: true,
});

export const productImagesSectionSchema = createProductFormSchema.pick({
  images: true,
});

export const productVariantsSectionSchema = createProductFormSchema.pick({
  selectedAttributes: true,
  variants: true,
});

// Type exports
export type CreateProductFormData = z.infer<typeof createProductFormSchema>;
export type SubDescriptionFormData = z.infer<typeof subDescriptionSchema>;
export type ProductImageFormData = z.infer<typeof productImageSchema>;
export type UploadedImageFormData = z.infer<typeof uploadedImageSchema>;
export type VariantAttributeFormData = z.infer<typeof variantAttributeSchema>;
export type ProductVariantFormData = z.infer<typeof productVariantSchema>;

export type ProductInformationFormData = z.infer<
  typeof productInformationSchema
>;
export type SEOSectionFormData = z.infer<typeof seoSectionSchema>;
export type SubDescriptionsSectionFormData = z.infer<
  typeof subDescriptionsSectionSchema
>;
export type ProductImagesSectionFormData = z.infer<
  typeof productImagesSectionSchema
>;
export type ProductVariantsSectionFormData = z.infer<
  typeof productVariantsSectionSchema
>;

// Default values for the form
export const defaultProductFormValues: Partial<CreateProductFormData> = {
  productName: "",
  category: "",
  brand: "",
  sku: "",
  description: "",
  basePrice: "",
  status: ProductStatus.ACTIVE,
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  subDescriptions: [
    {
      id: "1",
      title: "Fabric & Fit",
      content: "",
    },
    {
      id: "2",
      title: "Care Instructions",
      content: "",
    },
  ],
  images: [],
  selectedAttributes: [VariantAttributeType.COLOR, VariantAttributeType.SIZE],
  variants: [],
};

// Validation helper functions
export const validateProductForm = (data: unknown) => {
  return createProductFormSchema.safeParse(data);
};

export const validateProductInformation = (data: unknown) => {
  return productInformationSchema.safeParse(data);
};

export const validateSEOSection = (data: unknown) => {
  return seoSectionSchema.safeParse(data);
};

export const validateSubDescriptions = (data: unknown) => {
  return subDescriptionsSectionSchema.safeParse(data);
};

export const validateProductImages = (data: unknown) => {
  return productImagesSectionSchema.safeParse(data);
};

export const validateProductVariants = (data: unknown) => {
  return productVariantsSectionSchema.safeParse(data);
};