import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

config({ path: ".env" });

async function applyMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle({ client: pool });

  try {
    console.log("Checking migration status...");

    // Read the migration SQL directly
    const migrationSQL = readFileSync(
      join(process.cwd(), "lib/db/migrations/0003_luxuriant_silhouette.sql"),
      "utf-8"
    );

    console.log("Applying migration 0003_luxuriant_silhouette...");

    // Split by statement breakpoint and execute each statement
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await pool.query(statement);
    }

    console.log("✓ Migration applied successfully!");

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('addresses', 'carts', 'cart_items', 'orders', 'order_items')
      ORDER BY table_name;
    `);

    console.log("\nVerified tables:");
    result.rows.forEach((row) => console.log(`  - ${row.table_name}`));
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

applyMigration();
