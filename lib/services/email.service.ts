import { Resend } from "resend";
import { EmailConfirmation } from "@/components/email-template/email-confirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  sendConfirmationEmail: async ({
    to,
    name,
    confirmationLink,
  }: {
    to: string;
    name: string;
    confirmationLink: string;
  }) => {
    try {
      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        // to: [to],
        to: "hanifyaskur2@gmail.com",
        subject: "Konfirmasi Email - GII",
        react: EmailConfirmation({
          name,
          confirmationLink,
        }),
      });

      if (error) {
        console.error("Error sending email:", error);
        return {
          success: false,
          message: "Gagal mengirim email konfirmasi",
          data: null,
        };
      }

      console.log("Email sent successfully:", data);
      return {
        success: true,
        message: "Email konfirmasi berhasil dikirim",
        data,
      };
    } catch (error) {
      console.error("Email service error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mengirim email",
        data: null,
      };
    }
  },
};
