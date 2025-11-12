import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

async function applySlugMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  console.log("Applying slug migration...");

  try {
    // First, check if the column already exists
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'product_groups' AND column_name = 'slug'
    `);

    if (columnCheck.rows.length > 0) {
      console.log("✓ Column 'slug' already exists - checking for updates...");

      // Update any empty slugs
      const emptySlugResult = await pool.query(`
        SELECT id, name FROM product_groups WHERE slug = '' OR slug IS NULL ORDER BY created_at ASC
      `);

      if (emptySlugResult.rows.length > 0) {
        console.log(
          `Updating ${emptySlugResult.rows.length} products with empty slugs...`
        );
        const slugCounts = new Map<string, number>();

        for (const row of emptySlugResult.rows) {
          let baseSlug = row.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

          if (!baseSlug) {
            baseSlug = "product";
          }

          const count = slugCounts.get(baseSlug) || 0;
          const finalSlug = count > 0 ? `${baseSlug}-${count}` : baseSlug;
          slugCounts.set(baseSlug, count + 1);

          await pool.query(
            `UPDATE product_groups SET slug = $1 WHERE id = $2`,
            [finalSlug, row.id]
          );
        }
        console.log(
          `✓ Updated ${emptySlugResult.rows.length} products with slugs`
        );
      }

      return;
    }

    // Step 1: Add the slug column without constraints
    console.log("Adding slug column...");
    await pool.query(`
      ALTER TABLE "product_groups" ADD COLUMN "slug" text NOT NULL DEFAULT ''
    `);

    // Step 2: Update existing products to have slugs based on their names
    console.log("Updating existing products with slugs...");

    const result = await pool.query(`
      SELECT id, name FROM product_groups ORDER BY created_at ASC
    `);

    if (result.rows.length > 0) {
      const slugCounts = new Map<string, number>();

      for (const row of result.rows) {
        let baseSlug = row.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        if (!baseSlug) {
          baseSlug = "product";
        }

        const count = slugCounts.get(baseSlug) || 0;
        const finalSlug = count > 0 ? `${baseSlug}-${count}` : baseSlug;
        slugCounts.set(baseSlug, count + 1);

        await pool.query(`UPDATE product_groups SET slug = $1 WHERE id = $2`, [
          finalSlug,
          row.id,
        ]);
      }
      console.log(`✓ Updated ${result.rows.length} products with slugs`);
    } else {
      console.log("✓ No products need slug updates");
    }

    // Step 3: Add unique constraint
    console.log("Adding unique constraint to slug column...");
    await pool.query(`
      ALTER TABLE "product_groups" ADD CONSTRAINT "product_groups_slug_unique" UNIQUE("slug")
    `);

    console.log("✓ Migration applied successfully");
    console.log("  - Added 'slug' column to product_groups table");
    console.log("  - Updated existing products with slugs");
    console.log("  - Added unique constraint to slug column");
  } catch (error: any) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applySlugMigration();
