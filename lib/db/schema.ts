import {
  pgEnum,
  integer,
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  index,
} from "drizzle-orm/pg-core";

// Role options
const roleEnum = pgEnum("role", ["user", "admin", "super_admin"]);

export const roleOptions = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull().default(roleOptions.USER),
  isConfirmed: boolean("is_confirmed").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

// Verify table
export const verifyCodes = pgTable("verify_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  verifyType: text("verify_type").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type InsertVerifyCode = typeof verifyCodes.$inferInsert;
export type SelectVerifyCode = typeof verifyCodes.$inferSelect;

// Category options
const categoryEnum = pgEnum("category", [
  "smartphones",
  "televisions",
  "smart-watches",
  "home-appliances",
  "computer-laptops",
]);

export const categoryOptions = {
  SMARTPHONES: "smartphones",
  TELEVISIONS: "televisions",
  SMART_WATCHES: "smart-watches",
  HOME_APPLIANCES: "home-appliances",
  LAPTOPS: "laptops",
} as const;

// Brand options
const brandEnum = pgEnum("brand", ["apple", "samsung", "xiaomi"]);

export const brandOptions = {
  APPLE: "apple",
  SAMSUNG: "samsung",
  XIAOMI: "xiaomi",
} as const;

// Variant options
const variantEnum = pgEnum("variant", ["color", "screen", "storage", "type"]);

export const variantOptions = {
  COLOR: "color",
  SCREEN: "screen",
  STORAGE: "storage",
  TYPE: "type",
} as const;

// Product Group Table (Template/Base Product)
export const productGroups = pgTable("product_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: categoryEnum("category").notNull(),
  brand: brandEnum("brand").notNull(),
  description: text("description"), // Optional: deskripsi produk
  isActive: boolean("is_active").notNull().default(true),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type InsertProductGroup = typeof productGroups.$inferInsert;
export type SelectProductGroup = typeof productGroups.$inferSelect;

// Product Variant Table (Available variant options per product group)
export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productGroupId: uuid("product_group_id")
      .references(() => productGroups.id, { onDelete: "cascade" })
      .notNull(),
    variant: variantEnum("variant").notNull(),
    value: text("value").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    productGroupIdIdx: index("pv_product_group_id_idx").on(
      table.productGroupId
    ),
  })
);

export type InsertProductVariant = typeof productVariants.$inferInsert;
export type SelectProductVariant = typeof productVariants.$inferSelect;

// Products Table (Actual products with specific variant combinations)
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productGroupId: uuid("product_group_id")
      .references(() => productGroups.id, { onDelete: "cascade" })
      .notNull(),
    sku: text("sku").notNull().unique(), // e.g., "IPHONE-15-128GB-BLACK"
    name: text("name").notNull(), // e.g., "iPhone 15 128GB Black"
    price: integer("price").notNull(), // Harga dalam smallest currency unit (e.g., cents/rupiah)
    stock: integer("stock").notNull().default(0),
    weight: integer("weight"), // Optional: berat dalam gram untuk shipping
    isActive: boolean("is_active").notNull().default(true),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    productGroupIdIdx: index("p_product_group_id_idx").on(table.productGroupId),
    skuIdx: index("p_sku_idx").on(table.sku),
  })
);

export type InsertProduct = typeof products.$inferInsert;
export type SelectProduct = typeof products.$inferSelect;

// Product Variant Combinations Table (Links products to their specific variants)
export const productVariantCombinations = pgTable(
  "product_variant_combinations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    variantId: uuid("variant_id")
      .references(() => productVariants.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    productIdIdx: index("pvc_product_id_idx").on(table.productId),
    variantIdIdx: index("pvc_variant_id_idx").on(table.variantId),
    productVariantIdx: index("pvc_product_variant_idx").on(
      table.productId,
      table.variantId
    ),
  })
);

export type InsertProductVariantCombination =
  typeof productVariantCombinations.$inferInsert;
export type SelectProductVariantCombination =
  typeof productVariantCombinations.$inferSelect;
