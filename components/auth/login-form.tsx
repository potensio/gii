"use client";

// Form & Validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormInput, loginSchema } from "@/lib/validations/auth.validation";
import { useLogin } from "@/hooks/use-auth";

import { GalleryVerticalEnd } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input-1";
import { emailService } from "@/lib/services/email.service";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // Form & Validation
  const form = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
  });

  // Login mutation
  const loginMutation = useLogin();

  const onSubmit = async (data: LoginFormInput) => {
    await loginMutation.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-2xl font-semibold tracking-tight">
              Masuk ke GII.
            </h1>
            <FieldDescription>
              Belum punya akun? <Link href="/auth/register">Daftar</Link>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              size={"lg"}
              placeholder="budi@gmail.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.email.message}
              </p>
            )}
          </Field>

          <Field>
            <Button
              type="submit"
              size={"lg"}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? "Mengirim Magic Link"
                : "Kirim Magic Link"}
            </Button>
          </Field>
          <FieldSeparator>Atau</FieldSeparator>
          <Button variant="outline" type="button" size={"lg"}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Masuk dengan Google
          </Button>
        </FieldGroup>
      </form>
      {/* <FieldDescription className="text-center">
        Lupa password? <Link href="/auth/reset-pw">Klik di sini</Link>
      </FieldDescription> */}
    </div>
  );
}
