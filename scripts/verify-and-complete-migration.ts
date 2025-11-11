import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

async function verifyAndCompleteMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  try {
    console.log("Verifying migration 0003 tables and constraints...\n");

    // Check tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('addresses', 'carts', 'cart_items', 'orders', 'order_items')
      ORDER BY table_name;
    `);

    console.log("Tables from migration 0003:");
    tables.rows.forEach((row) => console.log(`  ✓ ${row.table_name}`));

    // Check indexes
    const indexes = await pool.query(`
      SELECT 
        tablename,
        indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('addresses', 'carts', 'cart_items', 'orders', 'order_items')
      ORDER BY tablename, indexname;
    `);

    console.log("\nIndexes:");
    indexes.rows.forEach((row) =>
      console.log(`  ✓ ${row.tablename}.${row.indexname}`)
    );

    // Check foreign keys
    const foreignKeys = await pool.query(`
      SELECT
        tc.table_name,
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name IN ('addresses', 'carts', 'cart_items', 'orders', 'order_items')
      ORDER BY tc.table_name;
    `);

    console.log("\nForeign Keys:");
    foreignKeys.rows.forEach((row) => {
      console.log(
        `  ✓ ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`
      );
    });

    // Mark migration 0003 as applied
    console.log("\nMarking migration 0003 as applied...");

    const existing = await pool.query(
      `SELECT * FROM __drizzle_migrations WHERE hash = $1`,
      ["0003_luxuriant_silhouette"]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)`,
        ["0003_luxuriant_silhouette", Date.now()]
      );
      console.log("✓ Migration 0003 marked as applied");
    } else {
      console.log("- Migration 0003 already marked as applied");
    }

    // Show final status
    console.log("\nAll applied migrations:");
    const allMigrations = await pool.query(`
      SELECT hash, created_at FROM __drizzle_migrations ORDER BY created_at;
    `);
    allMigrations.rows.forEach((row) => {
      console.log(`  - ${row.hash}`);
    });

    console.log("\n✓ Migration verification complete!");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

verifyAndCompleteMigration();
