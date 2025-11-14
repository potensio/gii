/**
 * CartDrawerSkeleton Component
 * Loading skeleton for cart drawer
 */

import { ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItemSkeleton } from "./cart-item-skeleton";

export function CartDrawerSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            <span className="text-xl font-semibold">Keranjang Belanja</span>
          </div>
          <Skeleton className="h-9 w-9 rounded" />
        </div>
      </div>

      {/* Bulk selection controls skeleton */}
      <div className="px-4 md:px-6 py-3 border-b bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
          </div>
        </div>
      </div>

      {/* Cart items skeleton */}
      <ScrollArea className="flex-1 px-4 md:px-6">
        <div className="divide-y">
          {[1, 2, 3].map((i) => (
            <CartItemSkeleton key={i} variant="drawer" selectable={true} />
          ))}
        </div>
      </ScrollArea>

      {/* Footer skeleton */}
      <div className="border-t p-4 md:p-6 bg-white">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-11 w-full rounded" />
          <Skeleton className="h-11 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
