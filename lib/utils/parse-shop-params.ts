import type { ProductFilters } from "@/hooks/use-products";
import type { FilterValues } from "@/hooks/use-filter-state";

interface ShopSearchParams {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  page?: string;
}

interface ParsedShopParams {
  // For productService.getProductGroups()
  filters: ProductFilters;
  // For UI components
  currentFilters: FilterValues;
  // Pagination metadata
  page: number;
  limit: number;
  // Validated sort
  sortBy: "newest" | "price-low" | "price-high" | "popularity";
}

/**
 * Parses and validates shop page URL search parameters
 * Converts raw URL params into typed, validated filter objects
 */
export function parseShopParams(
  params: ShopSearchParams,
  priceRange: { min: number; max: number }
): ParsedShopParams {
  // Parse and validate page parameter
  const parsedPage = parseInt(params.page || "1");
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  // Parse and validate price parameters
  const parsedMinPrice = parseInt(params.minPrice || "");
  const minPrice = isNaN(parsedMinPrice) ? undefined : parsedMinPrice;

  const parsedMaxPrice = parseInt(params.maxPrice || "");
  const maxPrice = isNaN(parsedMaxPrice) ? undefined : parsedMaxPrice;

  // Validate price range (ignore both if minPrice > maxPrice)
  let validMinPrice = minPrice;
  let validMaxPrice = maxPrice;
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    validMinPrice = undefined;
    validMaxPrice = undefined;
  }

  // Parse and validate sortBy parameter
  const sortBy = params.sortBy || "newest";
  const validSortBy = [
    "newest",
    "price-low",
    "price-high",
    "popularity",
  ].includes(sortBy)
    ? (sortBy as "newest" | "price-low" | "price-high" | "popularity")
    : "newest";

  const limit = 12;

  // Build filters object for productService
  const filters: ProductFilters = {
    category: params.category,
    brand: params.brand,
    search: params.search,
    minPrice: validMinPrice,
    maxPrice: validMaxPrice,
    sortBy: validSortBy,
    page,
    limit,
  };

  // Build currentFilters for UI components
  const currentFilters: FilterValues = {
    categories: params.category
      ? Array.isArray(params.category)
        ? params.category
        : [params.category]
      : [],
    brands: params.brand
      ? Array.isArray(params.brand)
        ? params.brand
        : [params.brand]
      : [],
    minPrice: validMinPrice || priceRange.min,
    maxPrice: validMaxPrice || priceRange.max,
    search: params.search || "",
  };

  return {
    filters,
    currentFilters,
    page,
    limit,
    sortBy: validSortBy,
  };
}

/**
 * Calculates active filter count for UI display
 */
export function calculateActiveFilterCount(
  currentFilters: FilterValues,
  priceRange: { min: number; max: number }
): number {
  return (
    currentFilters.categories.length +
    currentFilters.brands.length +
    (currentFilters.minPrice !== priceRange.min ? 1 : 0) +
    (currentFilters.maxPrice !== priceRange.max ? 1 : 0) +
    (currentFilters.search ? 1 : 0)
  );
}

/**
 * Calculates pagination display indices
 */
export function calculatePaginationIndices(
  page: number,
  limit: number,
  totalCount: number
): { startIndex: number; endIndex: number } {
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalCount);
  return { startIndex, endIndex };
}
