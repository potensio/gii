import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

async function applySessionIdMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  try {
    console.log("Applying session_id migration to carts table...");

    // Make userId nullable
    await pool.query(`
      ALTER TABLE "carts" ALTER COLUMN "user_id" DROP NOT NULL;
    `);
    console.log("✓ Made user_id nullable");

    // Add sessionId field
    await pool.query(`
      ALTER TABLE "carts" ADD COLUMN "session_id" text;
    `);
    console.log("✓ Added session_id column");

    // Add CHECK constraint
    await pool.query(`
      ALTER TABLE "carts" ADD CONSTRAINT "carts_identifier_check" 
      CHECK ("user_id" IS NOT NULL OR "session_id" IS NOT NULL);
    `);
    console.log("✓ Added CHECK constraint");

    // Add index on sessionId
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "cart_session_id_idx" 
      ON "carts" USING btree ("session_id") 
      WHERE "session_id" IS NOT NULL;
    `);
    console.log("✓ Added session_id index");

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

applySessionIdMigration();
