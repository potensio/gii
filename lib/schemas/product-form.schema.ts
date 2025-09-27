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
  file: z.instanceof(File, { message: "Invalid file" }).optional(), // Optional untuk gambar yang sudah ada
  preview: z.string().url("Invalid preview URL"),
  isThumbnail: z.boolean().default(false),
  isExisting: z.boolean().optional(), // Flag untuk membedakan gambar baru vs yang sudah ada
  existingImageData: z.object({
    url: z.string().url("Invalid image URL"),
    publicId: z.string(),
  }).optional(), // Data untuk gambar yang sudah ada
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
  sku: z.string().optional(), // Make SKU optional
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

// Base schema without superRefine for pick operations
const baseProductFormSchema = z.object({
  // Basic product information
  productName: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must be less than 200 characters")
    .trim(),

  category: z.string().min(1, "Category is required"),

  brand: z.string().min(1, "Brand is required"),

  // Product type toggle
  hasVariants: z.boolean().default(false),

  // Simple product fields (only required when hasVariants is false)
  simplePrice: z.string().optional(),

  simpleStock: z.string().optional(),

  simpleSku: z.string().optional(),

  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be less than 2000 characters"),

  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),

  // Product flags
  isFeatured: z.boolean().default(false),
  isLatest: z.boolean().default(false),

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
    .optional()
    .refine((subDescriptions) => {
      if (!subDescriptions) return true;
      return subDescriptions.every(
        (sub) => sub.title.trim() !== "" && sub.content.trim() !== ""
      );
    }, "All sub-descriptions must have both title and content filled")
    .refine(
      (subDescriptions) => !subDescriptions || subDescriptions.length <= 10,
      "Maximum 10 sub-descriptions allowed"
    ),

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

  // Variant attributes (only required when hasVariants is true)
  selectedAttributes: z.array(z.nativeEnum(VariantAttributeType)).optional(),

  variants: z.array(productVariantSchema).optional(),
});

// Main product creation form schema with validation
export const createProductFormSchema = baseProductFormSchema.superRefine(
  (data, ctx) => {
    // Validate simple product fields when hasVariants is false
    if (!data.hasVariants) {
      if (!data.simplePrice || data.simplePrice.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Price is required for simple products",
          path: ["simplePrice"],
        });
      } else {
        const num = parseFloat(data.simplePrice);
        if (isNaN(num) || num <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Price must be a positive number",
            path: ["simplePrice"],
          });
        } else if (num > 999999.99) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Price cannot exceed 999,999.99",
            path: ["simplePrice"],
          });
        }
      }

      if (!data.simpleStock || data.simpleStock.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Stock is required for simple products",
          path: ["simpleStock"],
        });
      } else {
        const num = parseInt(data.simpleStock);
        if (isNaN(num) || num < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Stock must be a non-negative integer",
            path: ["simpleStock"],
          });
        } else if (num > 999999) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Stock cannot exceed 999,999",
            path: ["simpleStock"],
          });
        }
      }

      if (!data.simpleSku || data.simpleSku.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "SKU is required for simple products",
          path: ["simpleSku"],
        });
      } else {
        if (!/^[A-Z0-9-_]+$/.test(data.simpleSku)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "SKU must contain only uppercase letters, numbers, hyphens, and underscores",
            path: ["simpleSku"],
          });
        } else if (data.simpleSku.length > 50) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "SKU must be less than 50 characters",
            path: ["simpleSku"],
          });
        }
      }
    }

    // Validate variant fields when hasVariants is true
    if (data.hasVariants) {
      if (!data.selectedAttributes || data.selectedAttributes.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "At least one variant attribute must be selected for complex products",
          path: ["selectedAttributes"],
        });
      } else if (data.selectedAttributes.length > 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maximum 5 variant attributes allowed",
          path: ["selectedAttributes"],
        });
      }

      if (!data.variants || data.variants.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "At least one product variant is required for complex products",
          path: ["variants"],
        });
      } else if (data.variants.length > 50) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maximum 50 variants allowed",
          path: ["variants"],
        });
      } else {
        // Check for duplicate variant combinations
        const combinations = data.variants.map((variant) =>
          variant.attributes
            .map((attr) => `${attr.type}:${attr.value}`)
            .sort()
            .join("|")
        );
        const uniqueCombinations = new Set(combinations);
        if (uniqueCombinations.size !== combinations.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Duplicate variant combinations are not allowed",
            path: ["variants"],
          });
        }
      }
    }
  }
);

// Additional validation schemas for specific sections
export const productInformationSchema = baseProductFormSchema.pick({
  productName: true,
  category: true,
  brand: true,
  hasVariants: true,
  simplePrice: true,
  simpleStock: true,
  simpleSku: true,
  description: true,
  status: true,
  isFeatured: true,
  isLatest: true,
});

export const seoSectionSchema = baseProductFormSchema.pick({
  metaTitle: true,
  metaDescription: true,
  keywords: true,
});

export const subDescriptionsSectionSchema = baseProductFormSchema.pick({
  subDescriptions: true,
});

export const productImagesSectionSchema = baseProductFormSchema.pick({
  images: true,
});

export const productVariantsSectionSchema = baseProductFormSchema.pick({
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
  hasVariants: false,
  simplePrice: "",
  simpleStock: "",
  simpleSku: "",
  description: "",
  status: ProductStatus.ACTIVE,
  isFeatured: false,
  isLatest: false,
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  subDescriptions: [], // Start with empty array instead of pre-filled items
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