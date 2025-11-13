import { MainNavigation } from "@/components/common/main-navigation";
import { SiteFooter } from "@/components/common/site-footer";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNavigation />
      <main className="flex-1">
        <div className="flex flex-col gap-10 md:gap-20 pb-10 md:pb-20">
          {/* Product Detail Content Skeleton */}
          <div className="container mx-auto px-4 py-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Product Gallery Skeleton */}
              <div className="space-y-4">
                {/* Main Image Skeleton */}
                <div className="aspect-square w-full bg-gray-200 rounded-lg animate-pulse" />

                {/* Thumbnail Images Skeleton */}
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gray-200 rounded-md animate-pulse"
                    />
                  ))}
                </div>
              </div>

              {/* Product Details Skeleton */}
              <div className="space-y-6">
                {/* Brand Skeleton */}
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />

                {/* Title Skeleton */}
                <div className="space-y-2">
                  <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Price Skeleton */}
                <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />

                {/* Description Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Variant Selection Skeleton */}
                <div className="space-y-4">
                  {/* First Variant Group */}
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="flex gap-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="h-10 w-20 bg-gray-200 rounded animate-pulse"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Second Variant Group */}
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-10 w-20 bg-gray-200 rounded animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quantity and Add to Cart Skeleton */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Stock Indicator Skeleton */}
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Product Description Skeleton */}
            <div className="mt-12 space-y-6">
              {/* Description Title Skeleton */}
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />

              {/* Description Content Skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
              </div>

              {/* Additional Descriptions Skeleton (Accordion) */}
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 w-full bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Related Products Carousel Skeleton */}
          <div className="container mx-auto px-4">
            <div className="space-y-6">
              {/* Carousel Title Skeleton */}
              <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />

              {/* Carousel Items Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    {/* Product Image Skeleton */}
                    <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />

                    {/* Product Name Skeleton */}
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    </div>

                    {/* Product Price Skeleton */}
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
