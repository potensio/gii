import { SelectProduct } from "../db/schema";

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
