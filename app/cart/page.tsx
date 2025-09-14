"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CartItem } from "@/components/cart/cart-item";
import { useCart } from "@/hooks/use-cart";

export default function page() {
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
  return (
    <div className="flex min-h-screen flex-col tracking-tight w-full ">
      <div className="flex flex-col flex-1 p-4 max-w-7xl mx-auto md:p-8 gap-10">
        {" "}
        {/* Header */}
        <h1 className="text-4xl font-semibold tracking-tighter">Keranjang</h1>
        <div className="flex flex-col lg:flex-row gap-20">
          <div className="flex-1 overflow-y-auto">
            {/* Bulk Selection Controls */}
            {items.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {items.filter((item) => item.selected).length} dari{" "}
                    {items.length} item dipilih
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAll}
                      className="text-sm"
                    >
                      Pilih Semua
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deselectAll}
                      className="text-sm"
                    >
                      Batal Pilih
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items */}
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

            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-xl text-gray-500 mb-2">Keranjang kosong</p>
                <p className="text-gray-400">
                  Tambahkan produk untuk mulai berbelanja
                </p>
              </div>
            )}
          </div>
          <aside className="hidden lg:block w-[400px] flex-shrink-0">
            <div className="sticky top-20 bg-muted rounded-2xl p-8">
              <div className="flex flex-col gap-6">
                <h2 className="text-xl tracking-tighter font-medium">
                  Ringkasan belanja
                </h2>

                {hasSelectedItems ? (
                  <>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row justify-between">
                        <p className="text-sm text-gray-600">
                          {items.filter((item) => item.selected).length} item
                          dipilih
                        </p>
                      </div>
                      <div className="flex flex-row justify-between border-b pb-2">
                        <p>Subtotal</p>
                        <p className="font-semibold">
                          Rp{selectedTotalPrice.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ongkos kirim akan dihitung saat checkout
                      </p>
                    </div>
                    <Textarea placeholder="Tuliskan catatan untuk pesanan ini"></Textarea>
                    <Button
                      className="flex-1 text-lg font-medium"
                      onClick={() => (window.location.href = "/cart/summary")}
                    >
                      Checkout ({items.filter((item) => item.selected).length}{" "}
                      item)
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">
                        Tidak ada item yang dipilih
                      </p>
                      <p className="text-sm text-gray-400">
                        Pilih item yang ingin di-checkout
                      </p>
                    </div>
                    <Button disabled className="flex-1 text-lg font-medium">
                      Pilih item untuk checkout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
        {/* Cart Items List */}
      </div>
    </div>
  );
}
