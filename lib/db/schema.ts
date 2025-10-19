import {
  pgEnum,
  integer,
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
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
