import { VariantAttributeType } from "@/lib/generated/prisma/enums";

export interface VariantAttribute {
  type: VariantAttributeType;
  name: string;
  value: string;
}

/**
 * Generates a consistent variant name based on product name and attributes
 * 
 * Rules:
 * - Simple products (no attributes): Use product name directly
 * - Complex products (with attributes): Use format "Product Name - Attribute1 • Attribute2"
 * 
 * @param productName - The name of the product
 * @param attributes - Array of variant attributes (empty for simple products)
 * @returns Generated variant name
 */
export function generateVariantName(
  productName: string,
  attributes: VariantAttribute[] = []
): string {
  // Trim and validate product name
  const cleanProductName = productName.trim();
  
  if (!cleanProductName) {
    throw new Error("Product name is required for variant name generation");
  }

  // For simple products (no attributes), use product name directly
  if (attributes.length === 0) {
    return cleanProductName;
  }

  // For complex products, create hierarchical naming
  // Priority order for attributes: STORAGE > COLOR > SIZE > MEMORY > PROCESSOR > others
  const priorityOrder: VariantAttributeType[] = [
    "STORAGE",
    "COLOR", 
    "SIZE",
    "MEMORY",
    "PROCESSOR",
    "MATERIAL",
    "CAPACITY",
    "MODEL",
    "DIMENSION",
    "FEATURE"
  ];

  // Sort attributes by priority
  const sortedAttributes = [...attributes].sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.type);
    const bIndex = priorityOrder.indexOf(b.type);
    
    // If attribute type not in priority list, put it at the end
    const aPriority = aIndex === -1 ? 999 : aIndex;
    const bPriority = bIndex === -1 ? 999 : bIndex;
    
    return aPriority - bPriority;
  });

  // Create variant details string
  const variantDetails = sortedAttributes
    .map(attr => attr.value.trim())
    .filter(value => value.length > 0) // Remove empty values
    .join(" • ");

  // Return formatted name: "Product Name - Variant Details"
  return variantDetails 
    ? `${cleanProductName} - ${variantDetails}`
    : cleanProductName; // Fallback to product name if no valid attributes
}

/**
 * Generates a SKU for a variant based on product name and variant index
 * 
 * @param productName - The name of the product
 * @param variantIndex - The index of the variant (0-based)
 * @param isSimple - Whether this is a simple product (affects SKU suffix)
 * @returns Generated SKU
 */
export function generateVariantSku(
  productName: string,
  variantIndex: number = 0,
  isSimple: boolean = false
): string {
  const baseSlug = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();

  if (isSimple) {
    return `${baseSlug}-default`;
  }

  return `${baseSlug}-${String(variantIndex + 1).padStart(2, "0")}`;
}

/**
 * Validates variant attributes for naming
 * 
 * @param attributes - Array of variant attributes to validate
 * @returns Validation result with any errors
 */
export function validateVariantAttributes(attributes: VariantAttribute[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for duplicate attribute types
  const attributeTypes = attributes.map(attr => attr.type);
  const uniqueTypes = new Set(attributeTypes);
  
  if (uniqueTypes.size !== attributeTypes.length) {
    errors.push("Duplicate attribute types are not allowed");
  }

  // Check for empty values
  const emptyValues = attributes.filter(attr => !attr.value.trim());
  if (emptyValues.length > 0) {
    errors.push("All attribute values must be provided");
  }

  // Check attribute count (max 5 for UI/UX reasons)
  if (attributes.length > 5) {
    errors.push("Maximum 5 attributes allowed per variant");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}