"use client";

import { useCart } from "@/hooks/use-cart";
import { CartItem } from "@/components/cart/cart-item";
import { OrderSummary } from "@/components/cart/order-summary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const {
    items,
    selectedTotalPrice,
    totalItems,
    selectedCount,
    hasSelectedItems,
    updateQuantity,
    removeItem,
    toggleSelection,
    selectAll,
    deselectAll,
  } = useCart();

  // Loading state for future API integration
  const isLoading = false;

  // Loading skeleton component
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-4 md:py-8 pb-32 lg:pb-8">
        <Skeleton className="h-8 w-48 mb-4 md:mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 pb-32 lg:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">
        Keranjang Belanja
      </h1>

      {items.length === 0 ? (
        // Empty cart state
        <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 scale-150"></div>
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-full">
              <ShoppingBag
                className="size-16 md:size-20 text-blue-500"
                strokeWidth={1.5}
              />
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">
            Keranjang Belanja Kosong
          </h2>
          <p className="text-gray-500 mb-8 max-w-md text-sm md:text-base">
            Belum ada produk di keranjang Anda. Mulai berbelanja dan temukan
            produk favorit Anda!
          </p>
          <Button asChild size="lg" className="px-8">
            <Link href="/shop">Lanjut Belanja</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Cart Items List */}
          <div className="lg:col-span-2">
            {/* Bulk Selection Controls */}
            <div className="mb-3 md:mb-4 p-3 md:p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 text-xs md:text-sm">
                  {items.filter((item) => item.selected).length} dari{" "}
                  {items.length} item dipilih
                </span>
                <div className="flex gap-1 md:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAll}
                    className="text-xs h-8 px-2 md:px-3"
                  >
                    Pilih Semua
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deselectAll}
                    className="text-xs h-8 px-2 md:px-3"
                  >
                    Batal Pilih
                  </Button>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="bg-white border rounded-lg divide-y">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  variant="page"
                  selectable={true}
                  onQuantityChange={updateQuantity}
                  onRemove={removeItem}
                  onSelectionChange={toggleSelection}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              totalItems={totalItems}
              selectedTotalPrice={selectedTotalPrice}
              selectedCount={selectedCount}
              hasSelectedItems={hasSelectedItems}
            />
          </div>
        </div>
      )}
    </div>
  );
}
