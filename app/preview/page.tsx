"use client";

import { EmailConfirmation } from "@/components/email-template/email-confirmation";

export default function page() {
  return (
    <div>
      <EmailConfirmation
        name="Ria Enriala"
        confirmationLink="https://thenightshift.com/confirm-email"
      />
    </div>
  );
}
