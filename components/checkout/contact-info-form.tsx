"use client";

import { useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldGroup } from "@/components/ui/field";
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
      fullName: "",
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
    <FieldGroup className="gap-4">
      <Field>
        <div className="group relative w-full">
          <label
            htmlFor="fullName"
            className="origin-start text-muted-foreground group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
          >
            <span className="bg-background inline-flex px-1">Nama Lengkap</span>
          </label>
          <Input
            id="fullName"
            type="text"
            placeholder=""
            disabled={isSubmitting}
            className="h-11"
            {...form.register("fullName")}
          />
        </div>
        {form.formState.errors.fullName && (
          <p className="text-destructive text-sm">
            {form.formState.errors.fullName.message}
          </p>
        )}
      </Field>
      <Field>
        <div className="group relative w-full">
          <label
            htmlFor="email"
            className="origin-start text-muted-foreground group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
          >
            <span className="bg-background inline-flex px-1">Email</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder=""
            disabled={isSubmitting}
            className="h-11"
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-destructive text-sm">
            {form.formState.errors.email.message}
          </p>
        )}
      </Field>
      <Field>
        <div className="group relative w-full">
          <div className="relative">
            <label
              htmlFor="phone"
              className="z-10 origin-start text-muted-foreground group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
            >
              <span className="bg-background inline-flex px-1">
                No. Handphone
              </span>
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder=""
              disabled={isSubmitting}
              className="peer pr-13 pl-12 h-11"
              {...form.register("phone")}
            />
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-sm peer-disabled:opacity-50">
              +62
            </span>
          </div>
        </div>
        {form.formState.errors.phone && (
          <p className="text-destructive text-sm">
            {form.formState.errors.phone.message}
          </p>
        )}
      </Field>
    </FieldGroup>
  );
});
