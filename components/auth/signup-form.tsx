"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, useSignupForm } from "@/hooks/use-auth";
import { SignupFormData } from "@/lib/auth-schema";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const { signup } = useAuth();
  const { form, errors, isSubmitting, handleSubmit, register, watch } =
    useSignupForm();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const result = await signup(data);
      if (result.success) {
        router.push("/"); // Redirect ke homepage setelah signup berhasil
      }
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-medium tracking-tighter">
          Buat akun baru
        </h1>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="nama">Nama Lengkap</Label>
          <Input
            id="nama"
            type="text"
            placeholder="Masukkan nama lengkap"
            {...register("nama")}
            className={errors.nama ? "border-red-500" : ""}
          />
          {errors.nama && (
            <p className="text-sm text-red-500">{errors.nama.message}</p>
          )}
        </div>
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
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimal 8 karakter"
            {...register("password")}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Password harus mengandung huruf besar, huruf kecil, dan angka
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Ulangi password"
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-red-500" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeToTerms"
            {...register("agreeToTerms")}
            className={errors.agreeToTerms ? "border-red-500" : ""}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="agreeToTerms"
              className="text-sm font-normal cursor-pointer"
            >
              Saya menyetujui{" "}
              <Link href="/terms" className="underline underline-offset-4">
                syarat dan ketentuan
              </Link>{" "}
              dan{" "}
              <Link href="/privacy" className="underline underline-offset-4">
                kebijakan privasi
              </Link>
            </Label>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-500">
                {errors.agreeToTerms.message}
              </p>
            )}
          </div>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? "Memproses..." : "Buat Akun"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Sudah punya akun?{" "}
        <Link href="/auth/login" className="underline underline-offset-4">
          Masuk sekarang
        </Link>
      </div>
    </form>
  );
}
