import { Button } from "@/components/ui/button";
import { MainNavigation } from "@/components/common/main-navigation";
import { productService } from "@/lib/services/product.service";
import type { ProductFilters } from "@/hooks/use-products";
import type { Metadata } from "next";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { ProductGrid } from "@/components/shop/product-grid";
import { SortSelect } from "@/components/shop/sort-select";
import { PaginationControls } from "@/components/shop/pagination-controls";
import { MobileFilterSheet } from "@/components/shop/mobile-filter-sheet";

// Apply Next.js revalidation
export const revalidate = 60;

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;

  // Build dynamic title based on active filters
  const titleParts: string[] = [];

  if (params.brand) {
    titleParts.push(params.brand);
  }

  if (params.category) {
    titleParts.push(params.category);
  }

  titleParts.push("Shop");

  const title = titleParts.join(" | ");

  // Build dynamic description based on active filters
  let description = "Browse our product catalog";

  if (params.category && params.brand) {
    description = `Shop ${params.brand} ${params.category} products`;
  } else if (params.category) {
    description = `Browse ${params.category} products`;
  } else if (params.brand) {
    description = `Shop ${params.brand} products`;
  }

  if (params.search) {
    description += ` - Search results for "${params.search}"`;
  }

  // Build canonical URL with current search parameters
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const canonicalUrl = new URL("/shop", baseUrl);

  // Add all search parameters to canonical URL
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      canonicalUrl.searchParams.set(key, value);
    }
  });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl.toString(),
    },
    alternates: {
      canonical: canonicalUrl.toString(),
    },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  try {
    // Parse and await search parameters
    const params = await searchParams;

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
    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
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

    // Build filters object
    const filters: ProductFilters = {
      category: params.category,
      brand: params.brand,
      search: params.search,
      minPrice: validMinPrice,
      maxPrice: validMaxPrice,
      sortBy: validSortBy,
      page,
      limit: 12,
    };

    // Fetch products and filter metadata in parallel
    const [productResult, categories, brands, priceRange] = await Promise.all([
      productService.getProductGroups(filters, "user"),
      productService.getCategories(),
      productService.getBrands(),
      productService.getPriceRange(),
    ]);

    const { products, totalCount, totalPages } = productResult;

    // Calculate display indices
    const startIndex = (page - 1) * 12;
    const endIndex = Math.min(startIndex + 12, totalCount);

    // Prepare current filters for FilterSidebar
    const currentFilters = {
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

    return (
      <>
        <div className="flex min-h-screen flex-col tracking-tight w-full">
          <MainNavigation />
          <main className="flex-col flex-1 p-4 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Desktop Sidebar Filters - Hidden on mobile */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-20">
                  <FilterSidebar
                    categories={categories}
                    brands={brands}
                    priceRange={priceRange}
                    currentFilters={currentFilters}
                  />
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Header with Mobile Filters and Sort */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  {/* Mobile Filter Sheet - Hidden on desktop */}
                  <div className="lg:hidden">
                    <MobileFilterSheet
                      categories={categories}
                      brands={brands}
                      priceRange={priceRange}
                      currentFilters={currentFilters}
                    />
                  </div>

                  {/* Sort Select */}
                  <div className="ml-auto">
                    <SortSelect currentSort={validSortBy} />
                  </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {totalCount > 0 ? startIndex + 1 : 0}-{endIndex} of{" "}
                    {totalCount} products
                  </p>
                </div>

                {/* Product Grid */}
                <div className="mb-8">
                  <ProductGrid products={products} />
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <PaginationControls
                      currentPage={page}
                      totalPages={totalPages}
                      totalResults={totalCount}
                      resultsPerPage={12}
                    />
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return (
      <div className="flex min-h-screen flex-col tracking-tight w-full">
        <main className="flex-col flex-1 p-4 md:p-8">
          <div className="text-center py-12">
            <p className="text-lg text-destructive mb-4">
              Failed to load products. Please try again later.
            </p>
            <Button variant="outline" asChild>
              <a href="/shop">Retry</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }
}
