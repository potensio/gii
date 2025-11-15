"use client";

import { useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  contactInfoSchema,
  type ContactInfoSchema,
} from "@/lib/validations/checkout.validation";

interface ContactInfoFormProps {
  isSubmitting?: boolean;
}

export interface ContactInfoFormRef {
  getData: () => ContactInfoSchema | null;
  isValid: () => boolean;
}

export const ContactInfoForm = forwardRef<
  ContactInfoFormRef,
  ContactInfoFormProps
>(({ isSubmitting = false }, ref) => {
  const form = useForm<ContactInfoSchema>({
    resolver: zodResolver(contactInfoSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      phone: "",
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
  );
});

ContactInfoForm.displayName = "ContactInfoForm";
