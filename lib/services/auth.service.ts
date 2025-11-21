import { db } from "@/lib/db/db";
import jwt from "jsonwebtoken";
import { users, verifyCodes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  RegisterFormInput,
  LoginFormInput,
} from "@/lib/validations/auth.validation";
import { nanoid } from "nanoid";
import { emailService } from "./email.service";

// Function to generate 6-digit verification code
const generateVerificationCode = (): string => {
  return nanoid(32);
};

export const authService = {
  register: async (input: RegisterFormInput) => {
    try {
      // 1. Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email));

      if (existingUser.length > 0) {
        return {
          success: false,
          message: "Email sudah terdaftar, login untuk melanjutkan",
          data: null,
        };
      }

      // 2. Insert user to database
      const result = await db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
        })
        .returning();

      // 3. Generate verification code
      const verificationCode = generateVerificationCode();

      // 4. Set expiration time (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // 5. Insert verification code to database
      await db.insert(verifyCodes).values({
        userId: result[0].id,
        verifyType: "register",
        code: verificationCode,
        expiresAt: expiresAt,
      });

      // 6. Send confirmation email
      const confirmationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?code=${verificationCode}&type=register`;

      const emailResult = await emailService.sendConfirmationEmail({
        to: result[0].email,
        name: result[0].name,
        confirmationLink,
      });

      // Log email result but don't fail registration if email fails
      if (!emailResult.success) {
        console.error(
          "Failed to send confirmation email:",
          emailResult.message
        );
        // You might want to add this to a retry queue or monitoring service
      }

      return {
        success: true,
        message: "Konfirmasi email berhasil dikirim",
        data: {
          name: result[0].name,
          email: result[0].email,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mendaftarkan user",
        data: null,
      };
    }
  },

  generateMagicLink: async (input: LoginFormInput) => {
    try {
      // 1. Check if user exists and is confirmed
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email));

      if (existingUser.length === 0) {
        return {
          success: false,
          message: "Email tidak terdaftar, silakan daftar terlebih dahulu",
          data: null,
        };
      }

      if (!existingUser[0].isConfirmed) {
        return {
          success: false,
          message:
            "Email belum dikonfirmasi, silakan cek email konfirmasi sebelumnya",
          data: null,
        };
      }

      // 2. Generate verification code for magic link
      const verificationCode = generateVerificationCode();

      // 3. Set expiration time (30 minutes from now for security)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      // 4. Insert verification code to database
      await db.insert(verifyCodes).values({
        userId: existingUser[0].id,
        verifyType: "login",
        code: verificationCode,
        expiresAt: expiresAt,
      });

      // 5. Send magic link email
      const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?code=${verificationCode}&type=login`;

      const emailResult = await emailService.sendMagicLinkEmail({
        to: existingUser[0].email,
        name: existingUser[0].name,
        magicLink,
      });

      // Log email result but don't fail if email fails
      if (!emailResult.success) {
        console.error("Failed to send magic link email:", emailResult.message);
        return {
          success: false,
          message: "Gagal mengirim magic link, silakan coba lagi",
          data: null,
        };
      }

      return {
        success: true,
        message: "Magic link berhasil dikirim ke email kamu",
        data: {
          email: existingUser[0].email,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mengirim magic link",
        data: null,
      };
    }
  },

  verifyRegister: async (code: string, type: string) => {
    try {
      // Check if verification code exists
      const existingCode = await db
        .select()
        .from(verifyCodes)
        .where(
          and(eq(verifyCodes.code, code), eq(verifyCodes.verifyType, type))
        );

      // Return if verification code doesn't exists
      if (existingCode.length === 0) {
        return {
          success: false,
          message: "Kode verifikasi tidak ditemukan atau sudah digunakan",
          data: null,
        };
      }

      // Return if verification code is expired
      if (existingCode[0].expiresAt < new Date()) {
        return {
          success: false,
          message: "Kode verifikasi sudah kadaluarsa",
          data: null,
        };
      }

      // Mark verification code as used
      await db
        .update(verifyCodes)
        .set({
          isUsed: true,
        })
        .where(eq(verifyCodes.id, existingCode[0].id));

      // Update user confirmation and get latest user
      const user = await db
        .update(users)
        .set({
          isConfirmed: true,
        })
        .where(eq(users.id, existingCode[0].userId))
        .returning();

      // Generate JWT token with role and status claims
      const token = jwt.sign(
        {
          userId: user[0].id,
          role: user[0].role,
          isActive: user[0].isActive,
          isDeleted: user[0].isDeleted,
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "30d",
        }
      );

      return {
        success: true,
        message: "User berhasil diverifikasi",
        data: { user: user[0], token },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Terjadi kesalahan saat memverifikasi user",
        data: null,
      };
    }
  },

  verifyLogin: async (code: string, type: string) => {
    try {
      // Check if verification code exists and is not used
      const existingCode = await db
        .select()
        .from(verifyCodes)
        .where(
          and(
            eq(verifyCodes.code, code),
            eq(verifyCodes.verifyType, type),
            eq(verifyCodes.isUsed, false)
          )
        );

      // Return if verification code doesn't exists or already used
      if (existingCode.length === 0) {
        return {
          success: false,
          message: "Magic link tidak valid atau sudah digunakan",
          data: null,
        };
      }

      // Return if verification code is expired
      if (existingCode[0].expiresAt < new Date()) {
        return {
          success: false,
          message: "Magic link sudah kadaluarsa, silakan minta yang baru",
          data: null,
        };
      }

      // Mark verification code as used
      await db
        .update(verifyCodes)
        .set({
          isUsed: true,
        })
        .where(eq(verifyCodes.id, existingCode[0].id));

      // Get user data
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, existingCode[0].userId));

      // Generate JWT token with role and status claims
      const token = jwt.sign(
        {
          userId: user[0].id,
          role: user[0].role,
          isActive: user[0].isActive,
          isDeleted: user[0].isDeleted,
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "30d",
        }
      );

      // Return user & token
      return {
        success: true,
        message: "Login berhasil, Happy shopping!",
        data: { user: user[0], token },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Terjadi kesalahan saat login",
        data: null,
      };
    }
  },
};
