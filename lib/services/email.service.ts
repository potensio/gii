import { Resend } from "resend";
import { EmailConfirmation } from "@/components/email-template/email-confirmation";
import { MagicLink } from "@/components/email-template/magic-link";

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

  sendMagicLinkEmail: async ({
    to,
    name,
    magicLink,
  }: {
    to: string;
    name: string;
    magicLink: string;
  }) => {
    try {
      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        // to: [to],
        to: "hanifyaskur2@gmail.com",
        subject: "Magic Link Login - GII",
        react: MagicLink({
          name,
          magicLink,
        }),
      });

      if (error) {
        console.error("Error sending magic link email:", error);
        return {
          success: false,
          message: "Gagal mengirim magic link email",
          data: null,
        };
      }

      console.log("Magic link email sent successfully:", data);
      return {
        success: true,
        message: "Magic link berhasil dikirim ke email kamu",
        data,
      };
    } catch (error) {
      console.error("Magic link email service error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mengirim magic link",
        data: null,
      };
    }
  },
};
