import z from "zod";

export const userSchema = z.object({
  name: z.string().min(1, { message: "Nama harus diisi" }),
  email: z.string().email({ message: "Email tidak valid" }),
  role: z.enum(["user", "admin"], { message: "Role harus dipilih" }),
});

export const editUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Nama harus diisi" }),
  email: z.string().email({ message: "Email tidak valid" }),
  role: z.enum(["user", "admin"], { message: "Role harus dipilih" }),
});

export type UserFormInput = z.infer<typeof userSchema>;
export type EditUserFormInput = z.infer<typeof editUserSchema>;