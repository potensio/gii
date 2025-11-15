import { z } from "zod";

// Contact info validation schema
export const contactInfoSchema = z.object({
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
});

// Address validation schema
export const addressSchema = z.object({
  recipientName: z.string().min(3, "Nama penerima minimal 3 karakter"),
  streetAddress: z.string().min(10, "Alamat lengkap minimal 10 karakter"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "Kota harus diisi"),
  state: z.string().min(2, "Provinsi harus diisi"),
  postalCode: z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit"),
});

// Guest checkout validation schema (combines contact + address)
export const guestCheckoutSchema = z.object({
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  address: addressSchema,
});

// Authenticated checkout validation schema
export const authenticatedCheckoutSchema = z.object({
  addressId: z.string().min(1, "Silakan pilih alamat pengiriman"),
});

export type ContactInfoSchema = z.infer<typeof contactInfoSchema>;
export type AddressSchema = z.infer<typeof addressSchema>;
export type GuestCheckoutSchema = z.infer<typeof guestCheckoutSchema>;
export type AuthenticatedCheckoutSchema = z.infer<
  typeof authenticatedCheckoutSchema
>;
