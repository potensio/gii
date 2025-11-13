import { SelectProduct } from "../db/schema";
import type { CompleteProduct } from "@/hooks/use-products";

/**
 * Generates a URL-friendly slug from a product name
 * @param name - The product name to convert
 * @returns A lowercase, hyphenated slug
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Extracts the thumbnail URL from images array or JSON string
 * @param images - Array of image objects or JSON string containing array of image objects
 * @returns The thumbnail URL or null if not found
 */
export function extractThumbnail(
  images:
    | Array<{ url: string; isThumbnail: boolean }>
    | string
    | null
    | undefined
): string | null {
  if (!images) return null;

  try {
    // If it's a string, parse it first
    const imageArray = typeof images === "string" ? JSON.parse(images) : images;

    if (!Array.isArray(imageArray) || imageArray.length === 0) return null;

    const thumbnail = imageArray.find((img: any) => img.isThumbnail);
    return thumbnail?.url || imageArray[0]?.url || null;
  } catch {
    return null;
  }
}

/**
 * Formats a price in cents/rupiah to Indonesian Rupiah currency string
 * @param priceInCents - Price in smallest currency unit
 * @returns Formatted price string (e.g., "Rp13.999.000")
 */
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(priceInCents);
}

/**
 * Finds the lowest price from an array of product variants
 * @param products - Array of product variants
 * @returns The minimum price, or 0 if no products
 */
export function getLowestPrice(products: SelectProduct[]): number {
  if (products.length === 0) return 0;
  return Math.min(...products.map((p) => p.price));
}

/**
 * Simplified product type for carousel display
 */
export interface SimplifiedProduct {
  id: string;
  name: string;
  brand: string;
  slug: string;
  price: string;
  thumbnailUrl: string | null;
}

/**
 * Finds a product that matches the given variant combination
 * Note: This is a placeholder for future implementation.
 * Currently, product selection uses a random approach.
 *
 * @param completeProduct - The complete product data with variants
 * @param selectedVariants - The selected variant combination (e.g., { "Warna": "Black", "Kapasitas": "256GB" })
 * @returns The matching product or null if not found
 */
export function findMatchingProduct(
  completeProduct: CompleteProduct,
  selectedVariants: Record<string, string>
): SelectProduct | null {
  // Future implementation: Match product by variant combination
  // For now, this is a placeholder that returns null
  // The actual implementation will compare selectedVariants with variantSelectionsByProductId

  const { products, variantSelectionsByProductId } = completeProduct;

  if (!variantSelectionsByProductId || products.length === 0) {
    return null;
  }

  // Find product where all selected variants match
  for (const product of products) {
    const productVariants = variantSelectionsByProductId[product.id];

    if (!productVariants) continue;

    // Check if all selected variants match this product's variants
    const allMatch = Object.entries(selectedVariants).every(
      ([variantType, variantValue]) =>
        productVariants[variantType] === variantValue
    );

    if (allMatch) {
      return product;
    }
  }

  return null;
}

/**
 * Transforms CompleteProduct to SimplifiedProduct for carousel display
 *
 * @param completeProduct - The complete product data from database
 * @returns Simplified product with formatted price and thumbnail
 */
export function transformToSimplifiedProduct(
  completeProduct: CompleteProduct
): SimplifiedProduct {
  const { productGroup, products } = completeProduct;

  // Get the lowest price from all product variants
  const lowestPrice = getLowestPrice(products);

  // Extract thumbnail URL from images
  const thumbnailUrl = extractThumbnail(productGroup.images);

  return {
    id: productGroup.id,
    name: productGroup.name,
    brand: productGroup.brand,
    slug: productGroup.slug,
    price: formatPrice(lowestPrice),
    thumbnailUrl,
  };
}

/**
 * Generates JSON-LD structured data for product schema
 * Follows schema.org Product specification for SEO
 *
 * @param completeProduct - The complete product data
 * @returns JSON-LD object for product structured data
 */
export function generateProductSchema(completeProduct: CompleteProduct) {
  const { productGroup, products } = completeProduct;

  // Get the lowest price from all product variants
  const lowestPrice = getLowestPrice(products);

  // Extract thumbnail URL from images
  const thumbnailUrl = extractThumbnail(productGroup.images);

  // Check if any product variant is in stock
  const inStock = products.some((p) => p.stock > 0);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productGroup.name,
    description: productGroup.description || undefined,
    image: thumbnailUrl || undefined,
    brand: {
      "@type": "Brand",
      name: productGroup.brand,
    },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: lowestPrice,
      priceCurrency: "IDR",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}
