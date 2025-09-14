import { z } from 'zod';

export const checkoutFormSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  nomorTelepon: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  alamatLengkap: z.string().min(10, 'Alamat terlalu pendek'),
  kota: z.string().min(1, 'Kota wajib diisi'),
  provinsi: z.string().min(1, 'Provinsi wajib diisi'),
  kodePos: z.string().regex(/^\d{5}$/, 'Kode pos harus 5 digit')
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

// Constants untuk checkout
export const SHIPPING_COST = 15000;
export const TAX_RATE = 0.11; // PPN 11%