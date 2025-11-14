"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useAddresses } from "@/hooks/use-addresses";
import { MainNavigation } from "@/components/common/main-navigation";
import { AddressSelector } from "@/components/checkout/address-selector";
import { GuestCheckoutForm } from "@/components/checkout/guest-checkout-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { me, isMeLoading } = useAuth();
  const cartQuery = useCart();
  const { addresses, isLoading: isAddressesLoading } = useAddresses();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = cartQuery.data?.data?.items || [];
  const isLoggedIn = !!me?.data?.id;

  // Calculate totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const shippingCost = 15000; // Fixed shipping cost
  const total = subtotal + shippingCost;

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const hasItems = items.length > 0;

  // Auto-select default address when addresses are loaded
  useEffect(() => {
    if (isLoggedIn && addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [isLoggedIn, addresses, selectedAddressId]);

  // Redirect to login if not authenticated (after loading check)
  useEffect(() => {
    if (!isMeLoading && !isLoggedIn) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/auth");
    }
  }, [isMeLoading, isLoggedIn, router]);

  // Handle authenticated checkout submission
  const handleAuthenticatedCheckout = async () => {
    if (!selectedAddressId) {
      toast.error("Silakan pilih alamat pengiriman");
      return;
    }

    if (!hasItems) {
      toast.error("Keranjang kosong");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/checkout/authenticated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ addressId: selectedAddressId }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Terjadi kesalahan, silakan coba lagi");
        return;
      }

      // Success - redirect to my orders page
      toast.success("Pesanan berhasil dibuat!");
      router.push(`/myorder?orderId=${result.data.orderId}`);
    } catch (error) {
      toast.error("Terjadi kesalahan, silakan coba lagi");
      console.error("Checkout error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isMeLoading || (isLoggedIn && isAddressesLoading)) {
    return (
      <div>
        <MainNavigation />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Memuat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MainNavigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Checkout Form Section - 2/3 width on desktop */}
          <div className="lg:col-span-2">
            {isLoggedIn ? (
              <AddressSelector
                addresses={addresses || []}
                selectedAddressId={selectedAddressId}
                onSelectAddress={setSelectedAddressId}
              />
            ) : (
              <GuestCheckoutForm
                cartItems={items}
                isCartLoading={cartQuery.isLoading}
              />
            )}
          </div>

          {/* Order Summary Section - 1/3 width on desktop */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Produk</span>
                  <span className="font-medium">{totalItems} item</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    Rp{subtotal.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ongkos Kirim</span>
                  <span className="font-medium">
                    Rp{shippingCost.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold">
                    Rp{total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {isLoggedIn && (
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!hasItems || !selectedAddressId || isSubmitting}
                  onClick={handleAuthenticatedCheckout}
                >
                  {isSubmitting ? "Memproses..." : "Buat Pesanan"}
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
