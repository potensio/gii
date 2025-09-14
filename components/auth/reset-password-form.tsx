"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useResetPasswordForm } from "@/hooks/use-auth";
import { ResetPasswordFormData } from "@/lib/auth-schema";
import { CheckCircle } from "lucide-react";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const { resetPassword } = useAuth();
  const { form, errors, isSubmitting, handleSubmit, register } =
    useResetPasswordForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const result = await resetPassword(data);
      if (result.success) {
        setIsSuccess(true);
        setSubmittedEmail(data.email);
      }
    } catch (error) {
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-medium tracking-tighter">
              Email terkirim!
            </h1>
            <p className="text-balance text-sm text-muted-foreground">
              Kami telah mengirim link reset password ke{" "}
              <span className="font-medium">{submittedEmail}</span>
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Silakan cek email Anda dan klik link yang diberikan untuk mereset
            password. Link akan kedaluwarsa dalam 24 jam.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/auth/login">Kembali ke Login</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsSuccess(false);
                form.reset();
              }}
            >
              Kirim ulang email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-medium tracking-tighter">
          Reset Password
        </h1>
        <p className="text-balance text-sm text-muted-foreground">
          Masukkan email Anda untuk menerima link reset password
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="nama@example.com"
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? "Mengirim..." : "Kirim Link Reset"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Ingat password Anda?{" "}
        <Link href="/auth/login" className="underline underline-offset-4">
          Kembali ke Login
        </Link>
      </div>
    </form>
  );
}
