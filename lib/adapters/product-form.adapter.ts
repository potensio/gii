import { CreateProductFormData } from "../schemas/product-form.schema";
import { CreateProductInput } from "../schemas/product.schema";
import {
  generateVariantName,
  generateVariantSku,
  VariantAttribute,
} from "../utils/variant-naming";

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

  if (!formData.productName?.trim()) {
    errors.push("Product name is required");
  }

  if (!formData.brand?.trim()) {
    errors.push("Brand is required");
  }

  if (!formData.category?.trim()) {
    errors.push("Category is required");
  }

  // Validate pricing based on product type
  if (formData.hasVariants) {
    // For products with variants, validate that variants exist
    if (!formData.variants || formData.variants.length === 0) {
      errors.push(
        "At least one variant is required for products with variants"
      );
    }
  } else {
    // For simple products, validate simple price and stock
    if (
      !formData.simplePrice ||
      isNaN(parseFloat(formData.simplePrice.toString()))
    ) {
      errors.push("Valid price is required for simple products");
    }
    if (
      formData.simpleStock === undefined ||
      isNaN(parseInt(formData.simpleStock.toString()))
    ) {
      errors.push("Valid stock is required for simple products");
    }
  }

  if (!formData.images || formData.images.length === 0) {
    errors.push("At least one image is required");
  }

  const thumbnailCount =
    formData.images?.filter((img) => img.isThumbnail).length || 0;
  if (thumbnailCount !== 1) {
    errors.push("Exactly one image must be set as thumbnail");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
