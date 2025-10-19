import { db } from "@/lib/db/db";
import jwt from "jsonwebtoken";
import { users, verifyCodes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { RegisterFormInput } from "@/lib/validations/auth.validation";
import { nanoid } from "nanoid";

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

      // Generate JWT token
      const token = jwt.sign(
        { userId: existingCode[0].userId },
        process.env.JWT_SECRET!,
        {
          expiresIn: "1h",
        }
      );

      // Mark verification code as used
      await db
        .update(verifyCodes)
        .set({
          isUsed: true,
        })
        .where(eq(verifyCodes.id, existingCode[0].id));

      // Return user
      const user = await db
        .update(users)
        .set({
          isConfirmed: true,
        })
        .where(eq(users.id, existingCode[0].userId))
        .returning();

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
          message: "Kode verifikasi tidak ditemukan",
          data: null,
        };
      }

      // Return if verification code is expired
      if (existingCode[0].expiresAt < new Date()) {
        return {
          success: false,
          message: "Kode verifikasi sudah expired",
          data: null,
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: existingCode[0].userId },
        process.env.JWT_SECRET!,
        {
          expiresIn: "1h",
        }
      );

      // Mark verification code as used
      await db
        .update(verifyCodes)
        .set({
          isUsed: true,
        })
        .where(eq(verifyCodes.id, existingCode[0].id));

      // Return user
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, existingCode[0].userId));

      // Return user & token
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
};
