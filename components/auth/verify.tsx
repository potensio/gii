"use client";

import { useVerify } from "@/hooks/use-auth";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface VerifyFormProps {
  type: string;
  code: string;
}

export function VerifyForm({ type, code }: VerifyFormProps) {
  const verifyMutation = useVerify(type, code);

  useEffect(() => {
    if (type && code) {
      verifyMutation.mutate();
    }
  }, [type, code, verifyMutation]);

  if (verifyMutation.error) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {" "}
            Verifikasi Gagal
          </h1>
          <p className="text-muted-foreground text-base">
            {verifyMutation.error.message}
          </p>
        </div>
        <Link href="/auth/register">← Kembali</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader className="size-8 animate-spin" />
        <h1 className="text-2xl font-semibold tracking-tight">
          {" "}
          Memverifikasi tautan kamu...
        </h1>
        <p className="text-muted-foreground text-base">
          Tunggu sebentar ya, proses ini biasanya cuma beberapa detik.
        </p>
      </div>
      <Link href="/auth/register">← Kembali</Link>
    </div>
  );
}
