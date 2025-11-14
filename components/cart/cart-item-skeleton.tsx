/**
 * CartItemSkeleton Component
 * Loading skeleton for cart items
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CartItemSkeletonProps {
  variant?: "drawer" | "page";
  selectable?: boolean;
}

export function CartItemSkeleton({
  variant = "drawer",
  selectable = false,
}: CartItemSkeletonProps) {
  const imageSize = variant === "drawer" ? "size-20" : "size-24 md:size-32";

  return (
    <div
      className={cn(
        "flex py-3 md:py-4 gap-3 md:gap-4",
        variant === "drawer" ? "gap-4" : "gap-4 md:gap-6",
        variant === "page" && "px-3 md:px-4"
      )}
    >
      {/* Checkbox skeleton */}
      {selectable && (
        <div className="flex items-start pt-2">
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      )}

      {/* Image skeleton */}
      <Skeleton className={cn("rounded-lg flex-shrink-0", imageSize)} />

      {/* Content skeleton */}
      <div className="flex flex-col justify-between gap-2 md:gap-3 flex-1 min-w-0">
        {/* Product info skeleton */}
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>

        {/* Price and controls skeleton */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            {variant === "page" && <Skeleton className="h-3 w-32" />}
          </div>

          {/* Quantity controls skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex flex-row gap-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-12 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            {variant === "page" && <Skeleton className="h-8 w-8 rounded" />}
          </div>
        </div>
      </div>
    </div>
  );
}
