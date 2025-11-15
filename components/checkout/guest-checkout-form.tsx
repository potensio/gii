"use client";

import { useRef, useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  guestCheckoutSchema,
  type GuestCheckoutSchema,
} from "@/lib/validations/checkout.validation";

interface GuestCheckoutFormProps {
  isSubmitting?: boolean;
}

export interface GuestCheckoutFormRef {
  getData: () => GuestCheckoutSchema | null;
  isValid: () => boolean;
}

export const GuestCheckoutForm = forwardRef<
  GuestCheckoutFormRef,
  GuestCheckoutFormProps
>(({ isSubmitting = false }, ref) => {
  const form = useForm<GuestCheckoutSchema>({
    resolver: zodResolver(guestCheckoutSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      phone: "",
      address: {
        recipientName: "",
        streetAddress: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
      },
    },
  });

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getData: () => {
      const values = form.getValues();
      return form.formState.isValid ? values : null;
    },
    isValid: () => form.formState.isValid,
  }));

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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="recipientName">Nama Penerima</FieldLabel>
            <Input
              id="recipientName"
              type="text"
              placeholder="Nama lengkap penerima"
              disabled={isSubmitting}
              {...form.register("address.recipientName")}
            />
            {form.formState.errors.address?.recipientName && (
              <p className="text-destructive text-sm">
                {form.formState.errors.address.recipientName.message}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="streetAddress">Alamat Lengkap</FieldLabel>
            <Textarea
              id="streetAddress"
              placeholder="Jalan, nomor rumah, RT/RW"
              rows={3}
              disabled={isSubmitting}
              {...form.register("address.streetAddress")}
            />
            {form.formState.errors.address?.streetAddress && (
              <p className="text-destructive text-sm">
                {form.formState.errors.address.streetAddress.message}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="addressLine2">
              Alamat Tambahan (Opsional)
            </FieldLabel>
            <Input
              id="addressLine2"
              type="text"
              placeholder="Patokan, landmark"
              disabled={isSubmitting}
              {...form.register("address.addressLine2")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="city">Kota</FieldLabel>
              <Input
                id="city"
                type="text"
                placeholder="Jakarta Selatan"
                disabled={isSubmitting}
                {...form.register("address.city")}
              />
              {form.formState.errors.address?.city && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.address.city.message}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="state">Provinsi</FieldLabel>
              <Input
                id="state"
                type="text"
                placeholder="DKI Jakarta"
                disabled={isSubmitting}
                {...form.register("address.state")}
              />
              {form.formState.errors.address?.state && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.address.state.message}
                </p>
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="postalCode">Kode Pos</FieldLabel>
            <Input
              id="postalCode"
              type="text"
              placeholder="12345"
              maxLength={5}
              disabled={isSubmitting}
              {...form.register("address.postalCode")}
            />
            {form.formState.errors.address?.postalCode && (
              <p className="text-destructive text-sm">
                {form.formState.errors.address.postalCode.message}
              </p>
            )}
          </Field>
        </FieldGroup>
      </div>
    </div>
  );
});

GuestCheckoutForm.displayName = "GuestCheckoutForm";
