import z from "zod";
import {
  VARIANT_TYPES,
  PRODUCT_CATEGORIES,
  PRODUCT_BRANDS,
} from "@/lib/enums";

// ====== Enum helpers (selaras dengan UI Select & Checkbox) ======
const VARIANT_TYPE_VALUES = [
  VARIANT_TYPES.COLOR.value,
  VARIANT_TYPES.STORAGE.value,
  VARIANT_TYPES.SIZE.value,
  VARIANT_TYPES.TYPE.value,
] as const;

const CATEGORY_VALUES = [
  PRODUCT_CATEGORIES.SMARTPHONES.value,
  PRODUCT_CATEGORIES.TELEVISIONS.value,
  PRODUCT_CATEGORIES.SMART_WATCHES.value,
  PRODUCT_CATEGORIES.HOME_APPLIANCES.value,
  PRODUCT_CATEGORIES.COMPUTER_LAPTOPS.value,
] as const;

const BRAND_VALUES = [
  PRODUCT_BRANDS.APPLE.value,
  PRODUCT_BRANDS.SAMSUNG.value,
  PRODUCT_BRANDS.XIAOMI.value,
] as const;

// ====== Variant option (per nilai varian yang tersedia di grup) ======
export const variantSchema = z.object({
  id: z.string().optional(),
  type: z.enum(VARIANT_TYPE_VALUES, { required_error: "Tipe varian harus diisi" }),
  value: z.string().min(1, { message: "Nilai varian harus diisi" }),
  active: z.boolean(),
});

export type VariantSchema = z.infer<typeof variantSchema>;

// ====== Kombinasi produk (produk aktual) ======
// UI menyimpan varian sebagai object { [variantType]: value }
const combinationVariantsSchema = z
  .record(z.string(), z.string().min(1, { message: "Nilai varian harus diisi" }))
  .refine(
    (obj) => Object.keys(obj).every((k) => (VARIANT_TYPE_VALUES as readonly string[]).includes(k)),
    { message: "Tipe varian tidak valid pada kombinasi" }
  );

export const variantCombinationSchema = z.object({
  id: z.string().optional(),
  variants: combinationVariantsSchema.default({}),
  sku: z.string().min(1, { message: "SKU harus diisi" }),
  name: z.string().optional(), // Nama kombinasi tidak ada di UI, boleh dikosongkan/di-derive
  price: z.coerce
    .number()
    .int({ message: "Harga harus berupa angka bulat" })
    .min(0, { message: "Harga harus lebih besar atau sama dengan 0" }),
  stock: z.coerce
    .number()
    .int({ message: "Stok harus berupa angka bulat" })
    .min(0, { message: "Stok harus lebih besar atau sama dengan 0" }),
  active: z.boolean(),
});

export type VariantCombinationSchema = z.infer<typeof variantCombinationSchema>;

// ====== Skema Form Produk (grup + pilihan varian + kombinasi) ======
export const productSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, { message: "Nama harus diisi" }),
    category: z.enum(CATEGORY_VALUES, { required_error: "Kategori harus dipilih" }),
    brand: z.enum(BRAND_VALUES, { required_error: "Merk harus dipilih" }),
    // Berat di UI ada di level grup, opsional; dikonversi ke number
    weight: z
      .coerce
      .number()
      .int({ message: "Berat harus berupa angka bulat" })
      .min(0, { message: "Berat harus lebih besar atau sama dengan 0" })
      .optional(),
    description: z.string().optional(),
    isActive: z.boolean(),
    hasVariants: z.boolean(),

    // Selaras dengan checkbox di UI (selectedVariants)
    variantTypes: z.array(z.enum(VARIANT_TYPE_VALUES)).default([]),

    // Selaras dengan daftar kombinasi di UI
    combinations: z
      .array(variantCombinationSchema)
      .min(1, { message: "Minimal satu kombinasi produk" }),
  })
  .superRefine((data, ctx) => {
    // Jika memakai varian, wajib pilih setidaknya satu tipe
    if (data.hasVariants) {
      if (data.variantTypes.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variantTypes"],
          message: "Pilih minimal satu tipe varian",
        });
      }

      // Setiap kombinasi harus mengandung semua tipe varian yang dipilih
      data.combinations.forEach((combination, idx) => {
        const keys = Object.keys(combination.variants);
        const required = data.variantTypes;
        const hasAllRequired = required.every((t) => keys.includes(t));
        if (!hasAllRequired) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["combinations", idx, "variants"],
            message: "Semua tipe varian yang dipilih harus diisi pada kombinasi",
          });
        }
      });
    } else {
      // Jika tidak memakai varian, kombinasi tidak boleh punya key varian
      data.combinations.forEach((combination, idx) => {
        if (Object.keys(combination.variants).length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["combinations", idx, "variants"],
            message: "Kombinasi tidak boleh memiliki varian saat varian dinonaktifkan",
          });
        }
      });
    }
  });

export type ProductSchema = z.infer<typeof productSchema>;
