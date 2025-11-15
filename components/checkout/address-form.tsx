"use client";

import { useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input-1";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  addressFormSchema,
  type AddressFormSchema,
  type AddressSchema,
} from "@/lib/validations/checkout.validation";

export type AddressFormData = AddressFormSchema;

interface AddressFormProps {
  initialData?: Partial<AddressFormData>;
  onSubmit?: (data: AddressFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  showDefaultCheckbox?: boolean;
  showSubmitButton?: boolean;
}

export interface AddressFormRef {
  getData: () => AddressSchema | null;
  isValid: () => boolean;
}

export const AddressForm = forwardRef<AddressFormRef, AddressFormProps>(
  (
    {
      initialData,
      onSubmit,
      onCancel,
      isSubmitting = false,
      showSubmitButton = true,
      showDefaultCheckbox = true,
    },
    ref
  ) => {
    const form = useForm<AddressFormData>({
      resolver: zodResolver(addressFormSchema),
      mode: "onChange",
      defaultValues: {
        recipientName: initialData?.recipientName || "",
        streetAddress: initialData?.streetAddress || "",
        addressLine2: initialData?.addressLine2 || "",
        city: initialData?.city || "",
        state: initialData?.state || "",
        postalCode: initialData?.postalCode || "",
        isDefault: initialData?.isDefault || false,
      },
    });

    const isDefaultValue = form.watch("isDefault");

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      getData: () => {
        const values = form.getValues();
        return form.formState.isValid ? values : null;
      },
      isValid: () => form.formState.isValid,
    }));

    return (
      <form
        onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}
        className="space-y-4"
      >
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="recipientName">Nama Penerima</FieldLabel>
            <Input
              id="recipientName"
              type="text"
              placeholder="Budi Utama"
              {...form.register("recipientName")}
            />
            {form.formState.errors.recipientName && (
              <p className="text-destructive text-sm">
                {form.formState.errors.recipientName.message}
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
        {showSubmitButton && (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Menyimpan Alamat..." : "Simpan Alamat"}
          </Button>
        )}
      </form>
    );
  }
);

AddressForm.displayName = "AddressForm";
