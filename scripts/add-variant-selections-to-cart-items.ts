/**
 * Migration Script: Add variant_selections column to cart_items table
 *
 * This script adds a new column to store variant selections for each cart item.
 * This allows different variations of the same product to be stored as separate items.
 *
 * Usage: npx tsx scripts/add-variant-selections-to-cart-items.ts
 */

import { db } from "@/lib/db/db";
import { sql } from "drizzle-orm";

async function addVariantSelectionsColumn() {
  console.log("Starting migration: Add variant_selections to cart_items...");

  try {
    // Check if column already exists
    const checkColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cart_items' 
      AND column_name = 'variant_selections'
    `);

    if (checkColumn.rows.length > 0) {
      console.log(
        "✓ Column 'variant_selections' already exists. Skipping migration."
      );
      return;
    }

    // Add the column with default value
    await db.execute(sql`
      ALTER TABLE cart_items 
      ADD COLUMN variant_selections TEXT NOT NULL DEFAULT '{}'
    `);

    console.log(
      "✓ Successfully added 'variant_selections' column to cart_items table"
    );
    console.log("✓ Migration completed successfully");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    throw error;
  }
}

// Run migration
addVariantSelectionsColumn()
  .then(() => {
    console.log("Migration script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
