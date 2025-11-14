"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { MainNavigation } from "@/components/common/main-navigation";
import { AddressSelector } from "@/components/checkout/address-selector";
import { GuestCheckoutForm } from "@/components/checkout/guest-checkout-form";
import { OrderSummary } from "@/components/cart/order-summary";

export default function CheckoutPage() {
  const { me } = useAuth();
  const cartQuery = useCart();
  const items = cartQuery.data?.data?.items || [];

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const hasItems = items.length > 0;

  // Check if user is logged in
  const isLoggedIn = !!me?.data?.id;

  return (
    <div>
      <MainNavigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Checkout Form Section - 2/3 width on desktop */}
          <div className="lg:col-span-2">
            {isLoggedIn ? (
              <AddressSelector />
            ) : (
              <GuestCheckoutForm
                cartItems={items}
                isCartLoading={cartQuery.isLoading}
              />
            )}
          </div>

          {/* Order Summary Section - 1/3 width on desktop */}
          <div className="lg:col-span-1">
            <OrderSummary
              totalItems={totalItems}
              totalPrice={totalPrice}
              hasItems={hasItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
