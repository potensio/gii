"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// Zod validation schema for contact info
const contactInfoSchema = z.object({
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
});

export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;

interface ContactInfoFormProps {
  initialData?: Partial<ContactInfoFormData>;
  onSubmit?: (data: ContactInfoFormData) => void;
  isSubmitting?: boolean;
}

export function ContactInfoForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: ContactInfoFormProps) {
  const form = useForm<ContactInfoFormData>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      email: initialData?.email || "",
      phone: initialData?.phone || "",
    },
  });

  return (
    <form
      onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}
      className="space-y-4"
    >
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
    </form>
  );
}
