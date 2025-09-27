import { CreateProductFormData } from "../schemas/product-form.schema";
import { CreateProductInput } from "../schemas/product.schema";
import {
  generateVariantName,
  generateVariantSku,
  VariantAttribute,
} from "../utils/variant-naming";
import { Product } from "../../components/admin/products/product-table-columns";
import { ProductImage, SubDescription, ProductVariant } from "../../components/admin/products/types";
import { VariantAttributeType } from "../generated/prisma/enums";

/**
 * Transforms form data from the product creation form to the API schema format
 * @param formData - The form data from React Hook Form
 * @returns Transformed data compatible with the API schema
 */
export function transformFormDataToApiSchema(
  formData: CreateProductFormData
): CreateProductInput {
  // Generate slug from product name
  const slug = formData.productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();

  // Transform basic product data
  const productData: CreateProductInput = {
    name: formData.productName,
    slug,
    description: formData.description,
    brandId: formData.brand,
    categoryId: formData.category,
    status: formData.status,
    isFeatured: formData.isFeatured || false,
    isLatest: formData.isLatest || false,
    metaTitle: formData.metaTitle || undefined,
    metaDescription: formData.metaDescription || undefined,

    // Add subdescriptions directly as JSON array
    subDescriptions:
      formData.subDescriptions && formData.subDescriptions.length > 0
        ? formData.subDescriptions.map((sub) => ({
            id: sub.id,
            title: sub.title,
            content: sub.content,
          }))
        : undefined,

    // Add uploaded images if available
    imageUrls: formData.uploadedImages
      ? formData.uploadedImages.map((img) => img.url)
      : undefined,
  };

  return productData;
}

/**
 * Transforms uploaded images to API image format
 * @param uploadedImages - The uploaded images from Vercel Blob
 * @returns Array of image data compatible with the API
 */
export function transformUploadedImagesToApiSchema(
  uploadedImages: Array<{
    url: string;
    filename: string;
    originalName: string;
    size: number;
    type: string;
    isMain: boolean;
  }>
) {
  return uploadedImages.map((image, index) => ({
    url: image.url,
    altText: `Product Image ${index + 1}`,
    sortOrder: index,
    isMain: image.isMain,
    filename: image.filename,
    originalName: image.originalName,
    size: image.size,
    type: image.type,
  }));
}

/**
 * Transforms form variants to API variant format
 * @param formData - The form data containing variants
 * @param productId - The ID of the created product
 * @returns Array of variant data compatible with the API
 */
export function transformVariantsToApiSchema(
  formData: CreateProductFormData,
  productId: string
) {
  if (!formData.variants) {
    return [];
  }

  return formData.variants.map((variant, index) => {
    // Convert form attributes to VariantAttribute format
    const attributes: VariantAttribute[] = variant.attributes.map((attr) => ({
      type: attr.type,
      name: attr.name,
      value: attr.value,
    }));

    // Generate variant name using the new naming system
    const variantName = generateVariantName(formData.productName, attributes);

    // Generate SKU - use provided SKU or auto-generate
    const variantSku =
      variant.sku && variant.sku.trim()
        ? variant.sku.trim()
        : generateVariantSku(formData.productName, index, false);

    return {
      productId,
      sku: variantSku,
      name: variantName,
      price: parseFloat(variant.price),
      stock: parseInt(variant.stock),
      isDefault: index === 0, // First variant is default
      // Note: attributes will be created separately via variant attributes API
    };
  });
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use transformUploadedImagesToApiSchema instead
 */
export function transformImagesToApiSchema(
  formData: CreateProductFormData,
  productId: string
) {
  // This function is now deprecated as we handle images through Vercel Blob upload
  console.warn(
    "transformImagesToApiSchema is deprecated. Use transformUploadedImagesToApiSchema instead."
  );

  return formData.images.map((image, index) => ({
    productId,
    url: image.preview, // Use preview URL as fallback
    altText: `${formData.productName} - Image ${index + 1}`,
    sortOrder: index,
    isMain: image.isThumbnail,
  }));
}

/**
 * Transforms form sub-descriptions to product specifications format
 * @param formData - The form data containing sub-descriptions
 * @param productId - The ID of the created product
 * @returns Array of specification data compatible with the API
 * @deprecated This function is no longer needed as subdescriptions are stored directly in the product
 */
export function transformSubDescriptionsToSpecifications(
  formData: CreateProductFormData,
  productId: string
) {
  // This function is deprecated - subdescriptions are now stored directly in the product
  return [];
}

/**
 * Complete transformation function that handles all form data
 * @param formData - The complete form data
 * @returns Object containing all transformed data for API calls
 */
export function transformCompleteFormData(formData: CreateProductFormData) {
  const productData = transformFormDataToApiSchema(formData);

  return {
    product: productData,
    // These will be used after product creation with the product ID
    getVariants: (productId: string) =>
      transformVariantsToApiSchema(formData, productId),
    getImages: (productId: string) =>
      transformImagesToApiSchema(formData, productId),
    // Specifications are no longer used - subdescriptions are stored directly in product
  };
}

/**
 * Validates that required form data is present for API transformation
 * @param formData - The form data to validate
 * @returns Object with validation result and any errors
 */
export function validateFormDataForApi(formData: CreateProductFormData) {
  const errors: string[] = [];

  // Basic validation
  if (!formData.productName?.trim()) {
    errors.push("Product name is required");
  }

  if (!formData.category) {
    errors.push("Category is required");
  }

  if (!formData.brand) {
    errors.push("Brand is required");
  }

  if (!formData.description?.trim()) {
    errors.push("Description is required");
  }

  // Validate variants if hasVariants is true
  if (formData.hasVariants) {
    if (!formData.variants || formData.variants.length === 0) {
      errors.push("At least one variant is required for variant products");
    } else {
      formData.variants.forEach((variant, index) => {
        if (!variant.price || parseFloat(variant.price) <= 0) {
          errors.push(`Variant ${index + 1}: Price is required and must be positive`);
        }
        if (!variant.stock || parseInt(variant.stock) < 0) {
          errors.push(`Variant ${index + 1}: Stock is required and must be non-negative`);
        }
        if (!variant.attributes || variant.attributes.length === 0) {
          errors.push(`Variant ${index + 1}: At least one attribute is required`);
        }
      });
    }
  } else {
    // Validate simple product fields
    if (!formData.simplePrice || parseFloat(formData.simplePrice) <= 0) {
      errors.push("Price is required and must be positive for simple products");
    }
    if (!formData.simpleStock || parseInt(formData.simpleStock) < 0) {
      errors.push("Stock is required and must be non-negative for simple products");
    }
  }

  // Validate images
  if (!formData.images || formData.images.length === 0) {
    if (!formData.uploadedImages || formData.uploadedImages.length === 0) {
      errors.push("At least one product image is required");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Transforms Product data from API/database to form data format for editing
 * @param product - The product data from API
 * @returns Form data compatible with CreateProductFormData
 */
export function transformProductToFormData(product: Product): Partial<CreateProductFormData> {
  // Transform basic product information
  const formData: Partial<CreateProductFormData> = {
    productName: product.name,
    category: product.category?.id || "",
    brand: product.brand?.id || "",
    description: product.description || "",
    status: product.status,
    isFeatured: product.isFeatured,
    isLatest: product.isLatest,
    hasVariants: product.hasVariants,
    metaTitle: "", // This field is not in Product interface, default to empty
    metaDescription: "", // This field is not in Product interface, default to empty
    keywords: "", // This field is not in Product interface, default to empty
  };

  // Handle simple product vs variants
  if (!product.hasVariants) {
    // For simple products, get data from the default variant
    const defaultVariant = product.variants?.find(v => v.isDefault);
    if (defaultVariant) {
      formData.simplePrice = defaultVariant.price.toString();
      formData.simpleStock = defaultVariant.stock.toString();
      formData.simpleSku = defaultVariant.sku;
    } else {
      // Fallback to product-level data if available
      formData.simplePrice = product.price?.toString() || "";
      formData.simpleStock = product.stock?.toString() || "";
      formData.simpleSku = product.sku || "";
    }
    
    formData.selectedAttributes = [];
    formData.variants = [];
  } else {
    // For variant products, transform variants
    if (product.variants && product.variants.length > 0) {
      // Extract unique attribute types from variants
      // Note: This is a simplified approach since the Product interface doesn't include variant attributes
      // In a real scenario, you'd need to fetch full variant data with attributes
      formData.selectedAttributes = [VariantAttributeType.COLOR, VariantAttributeType.SIZE]; // Default selection
      
      // Transform variants to form format
      formData.variants = product.variants.map((variant, index) => ({
        id: variant.id,
        price: variant.price.toString(),
        stock: variant.stock.toString(),
        sku: variant.sku,
        attributes: [
          {
            type: VariantAttributeType.COLOR,
            name: "Color",
            value: `Color ${index + 1}` // Placeholder since we don't have actual attribute data
          },
          {
            type: VariantAttributeType.SIZE,
            name: "Size", 
            value: `Size ${index + 1}` // Placeholder since we don't have actual attribute data
          }
        ]
      }));
    } else {
      formData.selectedAttributes = [];
      formData.variants = [];
    }
  }

  // Transform images - convert existing images to ProductImage format
  if (product.images && product.images.length > 0) {
    // Convert existing images to ProductImage format with isExisting flag
    formData.images = product.images.map((image, index) => ({
      id: image.id,
      preview: image.url,
      isThumbnail: index === 0, // First image is considered thumbnail
      isExisting: true,
      existingImageData: {
        url: image.url,
        publicId: image.id // Use image.id as fallback since publicId is not available
      }
    }));
    
    // Clear uploadedImages since we're using unified images array
    formData.uploadedImages = [];
  } else {
    formData.images = [];
    formData.uploadedImages = [];
  }

  // Sub-descriptions - Product interface doesn't include this, so default to empty
  formData.subDescriptions = [];

  return formData;
}
