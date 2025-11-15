"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useAddresses } from "@/hooks/use-addresses";
import {
  useGuestCheckout,
  useAuthenticatedCheckout,
} from "@/hooks/use-checkout";
import { MainNavigation } from "@/components/common/main-navigation";
import { AddressSelector } from "@/components/checkout/address-selector";
import {
  GuestCheckoutForm,
  type GuestCheckoutFormRef,
} from "@/components/checkout/guest-checkout-form";
import { OrderSummaryCard } from "@/components/checkout/order-summary-card";
import {
  authenticatedCheckoutSchema,
  type AuthenticatedCheckoutSchema,
} from "@/lib/validations/checkout.validation";

export default function CheckoutPage() {
  const { isLoggedIn, isMeLoading } = useAuth();
  const cartQuery = useCart();
  const { addresses, isLoading: isAddressesLoading } = useAddresses();
  const guestCheckout = useGuestCheckout();
  const authenticatedCheckout = useAuthenticatedCheckout();

  const guestFormRef = useRef<GuestCheckoutFormRef>(null);

  const cartItems = cartQuery.data?.data?.items || [];

  // Derive default address (always synced with DB)
  const defaultAddress =
    addresses?.find((addr) => addr.isDefault) || addresses?.[0];

  // Form for authenticated users
  const authenticatedForm = useForm<AuthenticatedCheckoutSchema>({
    resolver: zodResolver(authenticatedCheckoutSchema),
    values: {
      addressId: defaultAddress?.id || "",
    },
  });

  // Handle checkout
  const handleCheckout = () => {
    if (isLoggedIn) {
      const addressId = authenticatedForm.watch("addressId");
      if (addressId) {
        authenticatedCheckout.mutate(addressId);
      }
    } else {
      const guestData = guestFormRef.current?.getData();
      if (guestData) {
        guestCheckout.mutate(guestData);
      }
    }
  };

  // Determine if checkout button should be disabled
  const isCheckoutDisabled = isLoggedIn
    ? !authenticatedForm.watch("addressId")
    : !guestFormRef.current?.isValid();

  const isSubmitting = isLoggedIn
    ? authenticatedCheckout.isPending
    : guestCheckout.isPending;

  // Show loading state only for authenticated users loading addresses
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
          <div className="lg:col-span-2">
            {isLoggedIn ? (
              <AddressSelector
                addresses={addresses || []}
                selectedAddressId={authenticatedForm.watch("addressId")}
                onSelectAddress={(addressId) =>
                  authenticatedForm.setValue("addressId", addressId, {
                    shouldValidate: true,
                  })
                }
              />
            ) : (
              <GuestCheckoutForm
                ref={guestFormRef}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <OrderSummaryCard
              cartItems={cartItems}
              onCheckout={handleCheckout}
              isSubmitting={isSubmitting}
              disabled={isCheckoutDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
