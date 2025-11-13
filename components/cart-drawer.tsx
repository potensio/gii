"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { CartItem } from "@/components/cart/cart-item";
import { useCart } from "@/hooks/use-cart";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const {
    items,
    selectedTotalPrice,
    hasSelectedItems,
    updateQuantity,
    removeItem,
    toggleSelection,
    selectAll,
    deselectAll,
  } = useCart();

  const formattedSubtotal = selectedTotalPrice.toLocaleString("id-ID");

  const discount = 16.2; // Hardcoded discount for now

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col p-0 sm:max-w-[480px]"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="border-b px-4 md:px-6 py-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold">Cart</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label="Close cart"
            >
              <X className="size-5" />
            </Button>
          </div>
        </SheetHeader>

        {/* Bulk Selection Controls */}
        {items.length > 0 && (
          <div className="px-4 md:px-6 py-2 border-b bg-gray-50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {items.filter((item) => item.selected).length} dari{" "}
                {items.length} item dipilih
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  className="text-xs"
                >
                  Pilih Semua
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deselectAll}
                  className="text-xs"
                >
                  Batal Pilih
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6">
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
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-500 mb-2">Keranjang kosong</p>
              <p className="text-sm text-gray-400">
                Tambahkan produk untuk mulai berbelanja
              </p>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="border-t p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="md:text-lg font-medium">Jumlah</div>
              <p className="text-xs text-muted-foreground">
                Ongkos kirim dihitung saat checkout
              </p>
            </div>
            <div className="md:text-lg font-medium">Rp{formattedSubtotal}</div>
          </div>

          <div className="flex gap-4">
            <Button
              className="flex-1 text-lg font-medium"
              disabled={!hasSelectedItems}
              onClick={() => {
                if (hasSelectedItems) {
                  window.location.href = "/cart/summary";
                }
              }}
            >
              Checkout ({items.filter((item) => item.selected).length} item)
            </Button>
            <Button
              variant="outline"
              className="flex-1 py-6 text-lg font-medium"
              onClick={() => onOpenChange(false)}
            >
              Lihat Keranjang
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
