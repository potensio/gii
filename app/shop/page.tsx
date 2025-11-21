import { Button } from "@/components/ui/button";
import { MainNavigation } from "@/components/common/main-navigation";
import { productService } from "@/lib/services/product.service";
import type { Metadata } from "next";
import { ProductFilters as ProductFiltersComponent } from "@/components/shop/product-filters";
import { ProductGrid } from "@/components/shop/product-grid";
import { SortSelect } from "@/components/shop/sort-select";
import { PaginationControls } from "@/components/shop/pagination-controls";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  parseShopParams,
  calculateActiveFilterCount,
  calculatePaginationIndices,
} from "@/lib/utils/parse-shop-params";

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

    // Fetch filter metadata first (needed for parsing)
    const [categories, brands, priceRange] = await Promise.all([
      productService.getCategories(),
      productService.getBrands(),
      productService.getPriceRange(),
    ]);

    // Parse and validate all parameters
    const { filters, currentFilters, page, limit, sortBy } = parseShopParams(
      params,
      priceRange
    );

    // Fetch products with parsed filters
    const productResult = await productService.getProductGroups(
      filters,
      "user"
    );

    const { products, totalCount, totalPages } = productResult;

    // Calculate pagination display
    const { startIndex, endIndex } = calculatePaginationIndices(
      page,
      limit,
      totalCount
    );

    // Calculate active filter count for mobile button
    const activeFilterCount = calculateActiveFilterCount(
      currentFilters,
      priceRange
    );

    return (
      <>
        <div className="flex min-h-screen flex-col tracking-tight w-full">
          <MainNavigation />
          <main className="flex-col flex-1 p-4 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Desktop Sidebar Filters - Hidden on mobile */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-10">
                  <ProductFiltersComponent
                    data={{ categories, brands, priceRange }}
                    currentFilters={currentFilters}
                    mode="instant"
                  />
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Header with Mobile Filters and Sort */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  {/* Mobile Filter Sheet - Hidden on desktop */}
                  <div className="lg:hidden">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <SlidersHorizontal className="h-4 w-4" />
                          Filters
                          {activeFilterCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                            >
                              {activeFilterCount}
                            </Badge>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="left"
                        className="w-full sm:max-w-md overflow-y-auto"
                      >
                        <SheetHeader>
                          <SheetTitle>Filters</SheetTitle>
                          <SheetDescription>
                            Refine your product search with filters
                          </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                          <ProductFiltersComponent
                            data={{ categories, brands, priceRange }}
                            currentFilters={currentFilters}
                            mode="deferred"
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>

                  {/* Sort Select */}
                  <div className="ml-auto">
                    <SortSelect currentSort={sortBy} />
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
