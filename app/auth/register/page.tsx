"use client";

import { RegisterForm } from "@/components/auth/register-form";
import EmailConfirmation from "@/components/auth/email-confirmation";
import { useRegister } from "@/hooks/use-auth";

export default function RegisterPage() {
  const registerMutation = useRegister();

  // Show success message if email has been sent
  if (registerMutation.emailSent) {
    return <EmailConfirmation email={registerMutation.enteredEmail} />;
  }

  return (
    <div className="container mx-auto px-4">
      <RegisterForm registerMutation={registerMutation} />
    </div>
  );
}
