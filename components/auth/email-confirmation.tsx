"use client";

import Link from "next/link";

interface EmailConfirmationProps {
  email: string;
}

export default function EmailConfirmation({ email }: EmailConfirmationProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {" "}
          Verifikasi Email
        </h1>
        <p className="text-muted-foreground">
          Kami telah mengirim link verifikasi ke{" "}
          <span className="font-medium">{email}</span>. Klik link yang kami
          kirimkan untuk mengaktifkan akunmu.
        </p>
      </div>
      <Link href="/auth">← Kembali</Link>
    </div>
  );
}
