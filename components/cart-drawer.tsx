"use client";

import { useEffect, useState, useMemo } from "react";
import { X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem } from "@/components/cart/cart-item";
import { CartDrawerSkeleton } from "@/components/cart/cart-drawer-skeleton";
import { CartSyncIndicator } from "@/components/cart/cart-sync-indicator";
import {
  useCart,
  useUpdateCartQuantity,
  useRemoveFromCart,
  useToggleCartSelection,
  useSelectAllCart,
  useDeselectAllCart,
} from "@/hooks/use-cart";
import { useRouter } from "next/navigation";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const router = useRouter();
  // Track if component is mounted on client (Requirement 9.3, 9.4)
  const [isMounted, setIsMounted] = useState(false);

  // Query hooks
  const cartQuery = useCart();
  const items = cartQuery.data?.data?.items || [];
  const lastSyncedAt = cartQuery.data?.data?.lastUpdated || null;

  // Mutation hooks
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeItemMutation = useRemoveFromCart();
  const toggleSelectionMutation = useToggleCartSelection();
  const selectAllMutation = useSelectAllCart();
  const deselectAllMutation = useDeselectAllCart();

  // Computed values
  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const hasSelectedItems = useMemo(() => {
    return items.some((item) => item.selected);
  }, [items]);

  const isLoading = cartQuery.isLoading;
  const isSyncing =
    updateQuantityMutation.isPending ||
    removeItemMutation.isPending ||
    toggleSelectionMutation.isPending ||
    selectAllMutation.isPending ||
    deselectAllMutation.isPending;

  const syncError =
    updateQuantityMutation.error?.message ||
    removeItemMutation.error?.message ||
    toggleSelectionMutation.error?.message ||
    selectAllMutation.error?.message ||
    deselectAllMutation.error?.message ||
    null;

  // Action handlers
  const updateQuantity = (itemId: string, quantity: number) => {
    updateQuantityMutation.mutate({ itemId, quantity });
  };

  const removeItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const toggleSelection = (itemId: string) => {
    toggleSelectionMutation.mutate(itemId);
  };

  const selectAll = () => {
    selectAllMutation.mutate();
  };

  const deselectAll = () => {
    deselectAllMutation.mutate();
  };

  const retrySync = () => {
    cartQuery.refetch();
  };

  // Set mounted flag on client (Requirement 9.3, 9.4)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formattedSubtotal = totalPrice.toLocaleString("id-ID");
  const selectedItemsCount = items.filter((item) => item.selected).length;

  // Note: Database sync is disabled, so no error toasts needed
  // Cart works with localStorage only

  const handleViewCart = () => {
    onOpenChange(false);
    router.push("/cart");
  };

  const handleCheckout = () => {
    if (hasSelectedItems) {
      onOpenChange(false);
      router.push("/cart/summary");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col p-0 sm:max-w-[480px]"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="border-b px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-5" />
              <span className="text-xl font-semibold">Keranjang Belanja</span>
            </div>
            <div className="flex items-center gap-3">
              <CartSyncIndicator
                isSyncing={isSyncing}
                syncError={syncError}
                lastSyncedAt={lastSyncedAt}
                onRetry={retrySync}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                aria-label="Tutup keranjang"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Loading State - Show during hydration or loading (Requirement 9.4, 9.5) */}
        {!isMounted || isLoading ? (
          <CartDrawerSkeleton />
        ) : (
          <>
            {/* Bulk Selection Controls */}
            {items.length > 0 && (
              <div className="px-4 md:px-6 py-3 border-b bg-gray-50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {selectedItemsCount} dari {items.length} item dipilih
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAll}
                      className="text-xs h-8"
                    >
                      Pilih Semua
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deselectAll}
                      className="text-xs h-8"
                    >
                      Batal Pilih
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <ScrollArea className="flex-1 px-4 md:px-6">
              {items.length > 0 ? (
                <div className="divide-y">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      variant="drawer"
                      selectable={true}
                      onQuantityChange={updateQuantity}
                      onRemove={removeItem}
                      onSelectionChange={toggleSelection}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag className="size-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-500 mb-2">
                    Keranjang Kosong
                  </p>
                  <p className="text-sm text-gray-400 mb-6">
                    Tambahkan produk untuk mulai berbelanja
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      router.push("/shop");
                    }}
                  >
                    Lanjut Belanja
                  </Button>
                </div>
              )}
            </ScrollArea>

            {/* Footer - Only show when there are items */}
            {items.length > 0 && (
              <div className="border-t p-4 md:p-6 bg-white">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="text-sm text-gray-600">Subtotal</div>
                    <p className="text-xs text-muted-foreground">
                      Ongkos kirim dihitung saat checkout
                    </p>
                  </div>
                  <div className="text-xl font-bold">Rp{formattedSubtotal}</div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    className="w-full h-11 text-base font-medium"
                    disabled={!hasSelectedItems}
                    onClick={handleCheckout}
                  >
                    Checkout ({selectedItemsCount} item)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 text-base font-medium"
                    onClick={handleViewCart}
                  >
                    Lihat Keranjang
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
