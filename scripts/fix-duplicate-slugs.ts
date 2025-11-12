import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

async function fixDuplicateSlugs() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  try {
    // Find all duplicate slugs
    const duplicates = await pool.query(`
      SELECT slug, COUNT(*) as count 
      FROM product_groups 
      GROUP BY slug 
      HAVING COUNT(*) > 1
    `);

    console.log(`Found ${duplicates.rows.length} duplicate slugs`);

    for (const dup of duplicates.rows) {
      const slug = dup.slug;
      console.log(`\nFixing duplicate slug: ${slug}`);

      // Get all products with this slug
      const products = await pool.query(
        `SELECT id, name, slug FROM product_groups WHERE slug = $1 ORDER BY created_at ASC`,
        [slug]
      );

      // Keep the first one, update the rest
      for (let i = 1; i < products.rows.length; i++) {
        const newSlug = `${products.rows[i].slug}-${i}`;
        await pool.query(`UPDATE product_groups SET slug = $1 WHERE id = $2`, [
          newSlug,
          products.rows[i].id,
        ]);
        console.log(`  Updated ${products.rows[i].name} to slug: ${newSlug}`);
      }
    }

    console.log("\n✓ All duplicate slugs fixed");
  } catch (error) {
    console.error("Error fixing duplicate slugs:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixDuplicateSlugs();
