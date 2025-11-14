/**
 * CartPageSkeleton Component
 * Loading skeleton for cart page
 */

import { Skeleton } from "@/components/ui/skeleton";
import { CartItemSkeleton } from "./cart-item-skeleton";

export function CartPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 pb-32 lg:pb-8">
      {/* Page title skeleton */}
      <Skeleton className="h-8 w-48 mb-4 md:mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Cart Items */}
        <div className="lg:col-span-2">
          {/* Bulk selection controls skeleton */}
          <div className="mb-3 md:mb-4 p-3 md:p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between text-sm">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-1 md:gap-2">
                <Skeleton className="h-8 w-20 rounded" />
                <Skeleton className="h-8 w-20 rounded" />
              </div>
            </div>
          </div>

          {/* Cart items skeleton */}
          <div className="bg-white border rounded-lg divide-y">
            {[1, 2, 3].map((i) => (
              <CartItemSkeleton key={i} variant="page" selectable={true} />
            ))}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-4 md:p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-11 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
