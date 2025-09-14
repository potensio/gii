import { z } from 'zod';

// Login Schema
export const loginFormSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean().optional()
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

// Signup Schema
export const signupFormSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password harus mengandung huruf besar, huruf kecil, dan angka'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'Anda harus menyetujui syarat dan ketentuan'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword']
});

export type SignupFormData = z.infer<typeof signupFormSchema>;

// Reset Password Schema
export const resetPasswordFormSchema = z.object({
  email: z.string().email('Email tidak valid')
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

// New Password Schema (untuk halaman reset password dengan token)
export const newPasswordFormSchema = z.object({
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password harus mengandung huruf besar, huruf kecil, dan angka'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword']
});

export type NewPasswordFormData = z.infer<typeof newPasswordFormSchema>;

// Auth Response Types
export interface AuthUser {
  id: string;
  email: string;
  nama: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
}

// Auth Error Types
export interface AuthError {
  field?: string;
  message: string;
}