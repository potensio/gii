import z from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, { message: "Nama harus diisi" }),
  email: z.string().email({ message: "Email tidak valid" }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
});

export type RegisterFormInput = z.infer<typeof registerSchema>;
export type LoginFormInput = z.infer<typeof loginSchema>;
