"use client";

import { useRef, useState, useEffect } from "react";
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
  ContactInfoForm,
  type ContactInfoFormRef,
} from "@/components/checkout/contact-info-form";
import {
  AddressForm,
  type AddressFormRef,
} from "@/components/checkout/address-form";
import { OrderSummaryCard } from "@/components/checkout/order-summary-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const cartQuery = useCart();
  const { isLoggedIn, isMeLoading } = useAuth();
  const { addresses, isLoading: isAddressesLoading } = useAddresses();
  const guestCheckout = useGuestCheckout();
  const authenticatedCheckout = useAuthenticatedCheckout();

  const contactFormRef = useRef<ContactInfoFormRef>(null);
  const addressFormRef = useRef<AddressFormRef>(null);

  const cartItems = cartQuery.data?.data?.items || [];

  // Derive default address (always synced with DB)
  const defaultAddress =
    addresses?.find((addr) => addr.isDefault) || addresses?.[0];

  // Simple state for selected address (authenticated users only)
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Sync selectedAddressId with defaultAddress
  useEffect(() => {
    if (defaultAddress?.id) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [defaultAddress?.id]);

  // Handle checkout
  const handleCheckout = () => {
    if (isLoggedIn) {
      if (selectedAddressId) {
        authenticatedCheckout.mutate(selectedAddressId);
      }
    } else {
      // Combine contact info + address for guest checkout
      const contactData = contactFormRef.current?.getData();
      const addressData = addressFormRef.current?.getData();

      if (contactData && addressData) {
        guestCheckout.mutate({
          fullName: contactData.fullName,
          email: contactData.email,
          phone: contactData.phone,
          address: addressData,
        });
      }
    }
  };

  // Determine if checkout button should be disabled
  const isCheckoutDisabled = isLoggedIn
    ? !selectedAddressId
    : !(contactFormRef.current?.isValid() && addressFormRef.current?.isValid());

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
    <div className="flex flex-col min-h-screen">
      <MainNavigation />
      <div className="grid grid-cols-2 flex-1 h-full">
        <div className="col-span-1 space-y-6 p-5 lg:p-10 flex justify-center lg:justify-end">
          <div className="flex-1 max-w-lg">
            {isLoggedIn ? (
              <AddressSelector
                addresses={addresses || []}
                selectedAddressId={selectedAddressId}
                onSelectAddress={setSelectedAddressId}
              />
            ) : (
              <div className="space-y-8">
                {/* Contact Information Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold leading-tight">
                    Informasi Kontak
                  </h2>
                  <ContactInfoForm
                    ref={contactFormRef}
                    isSubmitting={isSubmitting}
                  />
                </div>

                {/* Delivery Address Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold leading-tight">
                    Alamat Pengiriman
                  </h2>
                  <AddressForm
                    ref={addressFormRef}
                    isSubmitting={isSubmitting}
                    showDefaultCheckbox={false}
                    showSubmitButton={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted col-span-1 space-y-6 p-5 lg:p-10 flex justify-center lg:justify-start">
          <div className="flex-1 max-w-lg space-y-4">
            <h2 className="text-lg font-semibold leading-tight">
              Ringkasan Pesanan
            </h2>

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
