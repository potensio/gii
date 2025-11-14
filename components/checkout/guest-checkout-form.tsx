"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/lib/types/cart.types";
import { AddressForm, AddressFormData } from "./address-form";

// Define GuestCheckoutFormData interface
export interface GuestCheckoutFormData {
  // Contact Information
  email: string;
  phone: string;

  // Delivery Address (from AddressForm)
  address: AddressFormData;
}

interface GuestCheckoutFormProps {
  cartItems: CartItem[];
  isCartLoading?: boolean;
}

// Zod validation schema for contact information only
const contactInfoSchema = z.object({
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
});

export function GuestCheckoutForm({
  cartItems,
  isCartLoading = false,
}: GuestCheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressData, setAddressData] = useState<AddressFormData | null>(null);
  const router = useRouter();

  const contactForm = useForm<{ email: string; phone: string }>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      email: "",
      phone: "",
    },
  });

  const isCartEmpty = cartItems.length === 0;

  const handleAddressSubmit = (data: AddressFormData) => {
    setAddressData(data);
  };

  const handleFinalSubmit = async (contactData: {
    email: string;
    phone: string;
  }) => {
    if (!addressData) {
      toast.error("Silakan lengkapi alamat pengiriman");
      return;
    }

    setIsSubmitting(true);
    try {
      // Transform data to match API expectations
      const checkoutData = {
        email: contactData.email,
        phone: contactData.phone,
        recipientName: addressData.recipientName,
        fullAddress: addressData.streetAddress,
        city: addressData.city,
        province: addressData.state,
        postalCode: addressData.postalCode,
        notes: addressData.addressLine2 || "",
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(checkoutData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (result.errors && Array.isArray(result.errors)) {
          result.errors.forEach((error: { field: string; message: string }) => {
            toast.error(error.message);
          });
        } else {
          toast.error(result.message || "Terjadi kesalahan, silakan coba lagi");
        }
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

  return (
    <div className="space-y-8">
      {/* Contact Information Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Informasi Kontak</h2>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="contoh@email.com"
              {...contactForm.register("email")}
            />
            {contactForm.formState.errors.email && (
              <p className="text-destructive text-sm">
                {contactForm.formState.errors.email.message}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">No. Telepon</FieldLabel>
            <Input
              id="phone"
              type="tel"
              placeholder="+62 812-3456-7890"
              {...contactForm.register("phone")}
            />
            {contactForm.formState.errors.phone && (
              <p className="text-destructive text-sm">
                {contactForm.formState.errors.phone.message}
              </p>
            )}
          </Field>
        </FieldGroup>
      </div>

      {/* Delivery Address Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Alamat Pengiriman</h2>
        <AddressForm
          onSubmit={handleAddressSubmit}
          isSubmitting={false}
          showDefaultCheckbox={false}
          submitButtonText="Lanjutkan"
        />
      </div>

      {/* Final Submit Button - Only shown after address is filled */}
      {addressData && (
        <form
          onSubmit={contactForm.handleSubmit(handleFinalSubmit)}
          className="flex justify-end"
        >
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || isCartEmpty || isCartLoading}
          >
            {isSubmitting ? "Memproses..." : "Buat Pesanan"}
          </Button>
        </form>
      )}
    </div>
  );
}
