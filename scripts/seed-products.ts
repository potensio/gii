import { db } from "../lib/db/db";
import {
  productGroups,
  productVariants,
  products,
  productVariantCombinations,
} from "../lib/db/schema";
import { and, eq } from "drizzle-orm";
import { generateSlug } from "../lib/utils/product.utils";

async function ensureProductGroup(input: {
  name: string;
  category: string;
  brand: string;
  description?: string;
  weight?: number | null;
}) {
  const existing = await db
    .select()
    .from(productGroups)
    .where(eq(productGroups.name, input.name))
    .limit(1);

  if (existing.length) return existing[0];

  const slug = generateSlug(input.name);
  const [created] = await db
    .insert(productGroups)
    .values({ ...input, slug })
    .returning();
  return created;
}

async function ensureVariant(
  productGroupId: string,
  variant: string,
  value: string
) {
  const existing = await db
    .select()
    .from(productVariants)
    .where(
      and(
        eq(productVariants.productGroupId, productGroupId),
        eq(productVariants.variant, variant),
        eq(productVariants.value, value)
      )
    )
    .limit(1);

  if (existing.length) return existing[0];

  const [created] = await db
    .insert(productVariants)
    .values({ productGroupId, variant, value })
    .returning();
  return created;
}

async function ensureProduct(input: {
  productGroupId: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
}) {
  const existing = await db
    .select()
    .from(products)
    .where(eq(products.sku, input.sku))
    .limit(1);

  if (existing.length) return existing[0];

  const [created] = await db.insert(products).values(input).returning();
  return created;
}

async function linkCombo(productId: string, variantId: string) {
  const existing = await db
    .select()
    .from(productVariantCombinations)
    .where(
      and(
        eq(productVariantCombinations.productId, productId),
        eq(productVariantCombinations.variantId, variantId)
      )
    )
    .limit(1);

  if (existing.length) return existing[0];

  const [created] = await db
    .insert(productVariantCombinations)
    .values({ productId, variantId })
    .returning();
  return created;
}

async function main() {
  // 1) Product Group (contoh)
  const group = await ensureProductGroup({
    name: "iPhone 15",
    category: "smartphones",
    brand: "apple",
    description: "Smartphone premium dari Apple.",
    weight: 200,
  });

  // 2) Variants untuk group tsb
  const colorBlack = await ensureVariant(group.id, "color", "black");
  const colorBlue = await ensureVariant(group.id, "color", "blue");
  const storage128 = await ensureVariant(group.id, "storage", "128GB");
  const storage256 = await ensureVariant(group.id, "storage", "256GB");

  // 3) 2–3 Produk (kombinasi varian)
  const p1 = await ensureProduct({
    productGroupId: group.id,
    sku: "IPH15-128-BLK",
    name: "iPhone 15 128GB Black",
    price: 14999000,
    stock: 10,
  });
  await linkCombo(p1.id, colorBlack.id);
  await linkCombo(p1.id, storage128.id);

  const p2 = await ensureProduct({
    productGroupId: group.id,
    sku: "IPH15-256-BLU",
    name: "iPhone 15 256GB Blue",
    price: 16999000,
    stock: 8,
  });
  await linkCombo(p2.id, colorBlue.id);
  await linkCombo(p2.id, storage256.id);

  const p3 = await ensureProduct({
    productGroupId: group.id,
    sku: "IPH15-128-BLU",
    name: "iPhone 15 128GB Blue",
    price: 14999000,
    stock: 5,
  });
  await linkCombo(p3.id, colorBlue.id);
  await linkCombo(p3.id, storage128.id);

  // 4) Product Group 2: Samsung Galaxy S24
  const group2 = await ensureProductGroup({
    name: "Galaxy S24",
    category: "smartphones",
    brand: "samsung",
    description: "Flagship dari Samsung.",
    weight: 195,
  });

  const g2ColorBlack = await ensureVariant(group2.id, "color", "black");
  const g2ColorCream = await ensureVariant(group2.id, "color", "cream");
  const g2Storage256 = await ensureVariant(group2.id, "storage", "256GB");
  const g2Storage512 = await ensureVariant(group2.id, "storage", "512GB");

  const s1 = await ensureProduct({
    productGroupId: group2.id,
    sku: "S24-256-BLK",
    name: "Galaxy S24 256GB Black",
    price: 13999000,
    stock: 12,
  });
  await linkCombo(s1.id, g2ColorBlack.id);
  await linkCombo(s1.id, g2Storage256.id);

  const s2 = await ensureProduct({
    productGroupId: group2.id,
    sku: "S24-512-CRM",
    name: "Galaxy S24 512GB Cream",
    price: 15999000,
    stock: 7,
  });
  await linkCombo(s2.id, g2ColorCream.id);
  await linkCombo(s2.id, g2Storage512.id);

  const s3 = await ensureProduct({
    productGroupId: group2.id,
    sku: "S24-256-CRM",
    name: "Galaxy S24 256GB Cream",
    price: 13999000,
    stock: 9,
  });
  await linkCombo(s3.id, g2ColorCream.id);
  await linkCombo(s3.id, g2Storage256.id);

  // 5) Product Group 3: Apple Watch Series 9
  const group3 = await ensureProductGroup({
    name: "Apple Watch Series 9",
    category: "smart-watches",
    brand: "apple",
    description: "Jam tangan pintar Apple.",
    weight: 52,
  });

  const g3Size41 = await ensureVariant(group3.id, "size", "41mm");
  const g3Size45 = await ensureVariant(group3.id, "size", "45mm");
  const g3TypeGPS = await ensureVariant(group3.id, "type", "gps");
  const g3TypeCellular = await ensureVariant(group3.id, "type", "cellular");
  const g3ColorMidnight = await ensureVariant(group3.id, "color", "midnight");

  const w1 = await ensureProduct({
    productGroupId: group3.id,
    sku: "AWS9-41-GPS-MID",
    name: "Apple Watch S9 41mm GPS Midnight",
    price: 7999000,
    stock: 20,
  });
  await linkCombo(w1.id, g3Size41.id);
  await linkCombo(w1.id, g3TypeGPS.id);
  await linkCombo(w1.id, g3ColorMidnight.id);

  const w2 = await ensureProduct({
    productGroupId: group3.id,
    sku: "AWS9-45-CEL-MID",
    name: "Apple Watch S9 45mm Cellular Midnight",
    price: 9999000,
    stock: 5,
  });
  await linkCombo(w2.id, g3Size45.id);
  await linkCombo(w2.id, g3TypeCellular.id);
  await linkCombo(w2.id, g3ColorMidnight.id);

  const w3 = await ensureProduct({
    productGroupId: group3.id,
    sku: "AWS9-45-GPS-MID",
    name: "Apple Watch S9 45mm GPS Midnight",
    price: 8999000,
    stock: 12,
  });
  await linkCombo(w3.id, g3Size45.id);
  await linkCombo(w3.id, g3TypeGPS.id);
  await linkCombo(w3.id, g3ColorMidnight.id);

  console.log(
    "Seed selesai: 3 product group, variants, dan produk ditambahkan."
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
