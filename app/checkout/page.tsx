"use client";

import { useState, useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useAddresses } from "@/hooks/use-addresses";
import {
  useGuestCheckout,
  useAuthenticatedCheckout,
} from "@/hooks/use-checkout";
import { MainNavigation } from "@/components/common/main-navigation";
import { AddressSelector } from "@/components/checkout/address-selector";
import { ContactInfoForm } from "@/components/checkout/contact-info-form";
import {
  AddressForm,
  AddressFormData,
} from "@/components/checkout/address-form";
import { OrderSummaryCard } from "@/components/checkout/order-summary-card";
import type { ContactInfoSchema } from "@/lib/validations/checkout.validation";

export default function CheckoutPage() {
  const cartQuery = useCart();
  const { isLoggedIn, isMeLoading } = useAuth();
  const { addresses, isLoading: isAddressesLoading } = useAddresses();
  const guestCheckout = useGuestCheckout();
  const authenticatedCheckout = useAuthenticatedCheckout();

  const cartItems = cartQuery.data?.data?.items || [];

  // Derive default address (always synced with DB)
  const defaultAddress =
    addresses?.find((addr) => addr.isDefault) || addresses?.[0];

  // Simple state for selected address (authenticated users only)
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Guest checkout form refs
  const contactFormRef = useRef<UseFormReturn<ContactInfoSchema> | null>(null);
  const addressFormRef = useRef<UseFormReturn<AddressFormData> | null>(null);

  // Track form validity for guest checkout (force re-render when forms change)
  const [formsValid, setFormsValid] = useState(false);

  // Sync selectedAddressId with defaultAddress
  useEffect(() => {
    if (defaultAddress?.id) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [defaultAddress?.id]);

  // Check form validity periodically for guest checkout
  useEffect(() => {
    if (!isLoggedIn) {
      const interval = setInterval(() => {
        const contactValid = contactFormRef.current?.formState.isValid ?? false;
        const addressValid = addressFormRef.current?.formState.isValid ?? false;
        setFormsValid(contactValid && addressValid);
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Handle checkout
  const handleCheckout = () => {
    if (isLoggedIn) {
      if (selectedAddressId) {
        authenticatedCheckout.mutate(selectedAddressId);
      }
    } else {
      // Validate and get form data
      const contactForm = contactFormRef.current;
      const addressForm = addressFormRef.current;

      if (contactForm?.formState.isValid && addressForm?.formState.isValid) {
        const contactData = contactForm.getValues();
        const addressData = addressForm.getValues();

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
  const isCheckoutDisabled = isLoggedIn ? !selectedAddressId : !formsValid;

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
      <div className="grid lg:grid-cols-2 flex-1 h-full">
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
                <div className="space-y-6">
                  <h2 className="text-lg font-medium tracking-tight">
                    Informasi Kontak
                  </h2>
                  <ContactInfoForm
                    isSubmitting={isSubmitting}
                    formRef={(form) => (contactFormRef.current = form)}
                  />
                </div>

                {/* Delivery Address Section */}
                <div className="space-y-6">
                  <h2 className="text-lg font-medium tracking-tight">
                    Alamat Pengiriman
                  </h2>
                  <AddressForm
                    isSubmitting={isSubmitting}
                    showDefaultCheckbox={false}
                    showSubmitButton={false}
                    formRef={(form) => (addressFormRef.current = form)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:bg-muted col-span-1 space-y-6 p-5 lg:p-10 flex justify-center lg:justify-start">
          <div className="flex-1 max-w-lg space-y-6">
            <h2 className="text-lg font-medium tracking-tight">
              Alamat Pengiriman
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
