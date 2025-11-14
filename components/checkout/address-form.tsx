"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Zod validation schema for address
const addressSchema = z.object({
  recipientName: z.string().min(3, "Nama penerima minimal 3 karakter"),
  phoneNumber: z.string().min(10, "Nomor telepon minimal 10 digit"),
  streetAddress: z.string().min(10, "Alamat lengkap minimal 10 karakter"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "Kota harus diisi"),
  state: z.string().min(2, "Provinsi harus diisi"),
  postalCode: z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit"),
  isDefault: z.boolean().optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  initialData?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  showDefaultCheckbox?: boolean;
  submitButtonText?: string;
  cancelButtonText?: string;
}

export function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showDefaultCheckbox = true,
  submitButtonText = "Simpan Alamat",
  cancelButtonText = "Batal",
}: AddressFormProps) {
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      recipientName: initialData?.recipientName || "",
      phoneNumber: initialData?.phoneNumber || "",
      streetAddress: initialData?.streetAddress || "",
      addressLine2: initialData?.addressLine2 || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      postalCode: initialData?.postalCode || "",
      isDefault: initialData?.isDefault || false,
    },
  });

  const isDefaultValue = form.watch("isDefault");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup className="gap-4">
        <Field>
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
          <FieldLabel htmlFor="phoneNumber">Nomor Telepon</FieldLabel>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="08xxxxxxxxxx"
            {...form.register("phoneNumber")}
          />
          {form.formState.errors.phoneNumber && (
            <p className="text-destructive text-sm">
              {form.formState.errors.phoneNumber.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="streetAddress">Alamat Lengkap</FieldLabel>
          <Textarea
            id="streetAddress"
            placeholder="Jalan, nomor rumah, RT/RW"
            rows={3}
            {...form.register("streetAddress")}
          />
          {form.formState.errors.streetAddress && (
            <p className="text-destructive text-sm">
              {form.formState.errors.streetAddress.message}
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
            {...form.register("addressLine2")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
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
            <FieldLabel htmlFor="state">Provinsi</FieldLabel>
            <Input
              id="state"
              type="text"
              placeholder="DKI Jakarta"
              {...form.register("state")}
            />
            {form.formState.errors.state && (
              <p className="text-destructive text-sm">
                {form.formState.errors.state.message}
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
            {...form.register("postalCode")}
          />
          {form.formState.errors.postalCode && (
            <p className="text-destructive text-sm">
              {form.formState.errors.postalCode.message}
            </p>
          )}
        </Field>

        {showDefaultCheckbox && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={isDefaultValue}
              onCheckedChange={(checked) =>
                form.setValue("isDefault", checked as boolean)
              }
            />
            <Label htmlFor="isDefault" className="cursor-pointer">
              Jadikan alamat utama
            </Label>
          </div>
        )}
      </FieldGroup>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Menyimpan..." : submitButtonText}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelButtonText}
          </Button>
        )}
      </div>
    </form>
  );
}
