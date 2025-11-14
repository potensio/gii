"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/lib/types/cart.types";

// Define GuestCheckoutFormData interface
export interface GuestCheckoutFormData {
  // Contact Information
  email: string;
  phone: string;

  // Delivery Address
  recipientName: string;
  fullAddress: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
}

interface GuestCheckoutFormProps {
  cartItems: CartItem[];
  isCartLoading?: boolean;
}

// Zod validation schema
const guestCheckoutSchema = z.object({
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  recipientName: z.string().min(3, "Nama penerima minimal 3 karakter"),
  fullAddress: z.string().min(10, "Alamat lengkap minimal 10 karakter"),
  city: z.string().min(2, "Kota harus diisi"),
  province: z.string().min(2, "Provinsi harus diisi"),
  postalCode: z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit"),
  notes: z.string().optional(),
});

export function GuestCheckoutForm({
  cartItems,
  isCartLoading = false,
}: GuestCheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<GuestCheckoutFormData>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      email: "",
      phone: "",
      recipientName: "",
      fullAddress: "",
      city: "",
      province: "",
      postalCode: "",
      notes: "",
    },
  });

  const isCartEmpty = cartItems.length === 0;

  const onSubmit = async (data: GuestCheckoutFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-destructive text-sm">
                {form.formState.errors.email.message}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">No. Telepon</FieldLabel>
            <Input
              id="phone"
              type="tel"
              placeholder="+62 812-3456-7890"
              {...form.register("phone")}
            />
            {form.formState.errors.phone && (
              <p className="text-destructive text-sm">
                {form.formState.errors.phone.message}
              </p>
            )}
          </Field>
        </FieldGroup>
      </div>

      {/* Delivery Address Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Alamat Pengiriman</h2>
        <FieldGroup className="gap-6">
          <Field className="col-span-1">
            <FieldLabel htmlFor="recipientName">Nama Penerima</FieldLabel>
            <Input
              id="recipientName"
              type="text"
              placeholder="Nama lengkap penerima"
              {...form.register("recipientName")}
            />
            {form.formState.errors.recipientName && (
              <p className="text-destructive text-sm">
                {form.formState.errors.recipientName.message}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="fullAddress">Alamat Lengkap</FieldLabel>
            <Textarea
              id="fullAddress"
              placeholder="Jl. Contoh No. 123, RT 01/RW 02"
              rows={3}
              {...form.register("fullAddress")}
            />
            {form.formState.errors.fullAddress && (
              <p className="text-destructive text-sm">
                {form.formState.errors.fullAddress.message}
              </p>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-6">
            {" "}
            <Field>
              <FieldLabel htmlFor="city">Kota</FieldLabel>
              <Input
                id="city"
                type="text"
                placeholder="Jakarta Selatan"
                {...form.register("city")}
              />
              {form.formState.errors.city && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.city.message}
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="province">Provinsi</FieldLabel>
              <Input
                id="province"
                type="text"
                placeholder="DKI Jakarta"
                {...form.register("province")}
              />
              {form.formState.errors.province && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.province.message}
                </p>
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="postalCode">Kode Pos</FieldLabel>
            <Input
              id="postalCode"
              type="text"
              placeholder="12190"
              maxLength={5}
              {...form.register("postalCode")}
            />
            {form.formState.errors.postalCode && (
              <p className="text-destructive text-sm">
                {form.formState.errors.postalCode.message}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="notes">Catatan (Opsional)</FieldLabel>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan untuk pengiriman"
              rows={2}
              {...form.register("notes")}
            />
          </Field>
        </FieldGroup>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || isCartEmpty || isCartLoading}
        >
          {isSubmitting ? "Memproses..." : "Buat Pesanan"}
        </Button>
      </div>
    </form>
  );
}
