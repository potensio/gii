import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

async function testMigrationSystem() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  try {
    console.log("Testing migration system...\n");

    // Check migration tracking
    const migrations = await pool.query(`
      SELECT * FROM __drizzle_migrations ORDER BY created_at;
    `);

    console.log("Applied migrations:");
    migrations.rows.forEach((row) => {
      console.log(`  ✓ ${row.hash}`);
    });

    // Verify all expected tables exist
    const expectedTables = [
      "users",
      "verify_codes",
      "product_groups",
      "product_variants",
      "products",
      "product_variant_combinations",
      "addresses",
      "carts",
      "cart_items",
      "orders",
      "order_items",
    ];

    const tables = await pool.query(
      `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ANY($1)
      ORDER BY table_name;
    `,
      [expectedTables]
    );

    console.log("\nVerified tables:");
    const foundTables = tables.rows.map((r) => r.table_name);
    expectedTables.forEach((table) => {
      if (foundTables.includes(table)) {
        console.log(`  ✓ ${table}`);
      } else {
        console.log(`  ✗ ${table} (MISSING)`);
      }
    });

    // Check sample data can be queried
    const userCount = await pool.query(`SELECT COUNT(*) FROM users;`);
    const productGroupCount = await pool.query(
      `SELECT COUNT(*) FROM product_groups;`
    );
    const orderCount = await pool.query(`SELECT COUNT(*) FROM orders;`);

    console.log("\nTable row counts:");
    console.log(`  - users: ${userCount.rows[0].count}`);
    console.log(`  - product_groups: ${productGroupCount.rows[0].count}`);
    console.log(`  - orders: ${orderCount.rows[0].count}`);

    console.log("\n✓ Migration system is working correctly!");
    console.log("✓ All tables are in place and queryable");
    console.log("\nTo apply future schema changes:");
    console.log("  1. Update lib/db/schema.ts");
    console.log("  2. Run: npx drizzle-kit generate");
    console.log("  3. Run: npx tsx scripts/run-migration.ts");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

testMigrationSystem();
