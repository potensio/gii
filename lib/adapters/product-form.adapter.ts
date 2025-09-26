import { CreateProductFormData } from "../schemas/product-form.schema";
import { CreateProductInput } from "../schemas/product.schema";

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
    basePrice: parseFloat(formData.basePrice),
    status: formData.status,
    featured: false, // Default to false, can be updated later
    metaTitle: formData.metaTitle || undefined,
    metaDescription: formData.metaDescription || undefined,

    // Transform sub-descriptions into fabricFit and careInstructions
    fabricFit:
      formData.subDescriptions.find(
        (sub) =>
          sub.title.toLowerCase().includes("fabric") ||
          sub.title.toLowerCase().includes("fit")
      )?.content || undefined,

    careInstructions:
      formData.subDescriptions.find(
        (sub) =>
          sub.title.toLowerCase().includes("care") ||
          sub.title.toLowerCase().includes("instruction")
      )?.content || undefined,

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
  return formData.variants.map((variant, index) => {
    // Generate variant name from attributes
    const variantName = variant.attributes
      .map((attr) => attr.value)
      .join(" / ");

    // Generate variant slug
    const variantSlug = `${formData.productName}-${variantName}`
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Generate SKU if not provided (using base SKU + variant index)
    const variantSku = `${formData.sku}-${String(index + 1).padStart(2, "0")}`;

    return {
      productId,
      sku: variantSku,
      name: variantName,
      slug: variantSlug,
      price: parseFloat(variant.price),
      stock: parseInt(variant.stock),
      isDefault: index === 0, // First variant is default
      attributes: variant.attributes.map((attr, attrIndex) => ({
        type: attr.type,
        name: attr.name,
        value: attr.value,
        sortOrder: attrIndex,
      })),
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
 */
export function transformSubDescriptionsToSpecifications(
  formData: CreateProductFormData,
  productId: string
) {
  return formData.subDescriptions
    .filter(
      (sub) =>
        // Only include sub-descriptions that aren't used for fabricFit or careInstructions
        !sub.title.toLowerCase().includes("fabric") &&
        !sub.title.toLowerCase().includes("fit") &&
        !sub.title.toLowerCase().includes("care") &&
        !sub.title.toLowerCase().includes("instruction")
    )
    .map((sub, index) => ({
      productId,
      name: sub.title,
      value: sub.content,
      sortOrder: index,
    }));
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
    getSpecifications: (productId: string) =>
      transformSubDescriptionsToSpecifications(formData, productId),
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

  if (!formData.basePrice || isNaN(parseFloat(formData.basePrice))) {
    errors.push("Valid base price is required");
  }

  if (!formData.variants || formData.variants.length === 0) {
    errors.push("At least one variant is required");
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