import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

async function addVillageColumn() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  console.log("Adding village column to addresses table...");

  try {
    // Add village column with default value first
    await pool.query(
      `ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "village" text DEFAULT ''`
    );

    // Update existing rows to have empty string
    await pool.query(
      `UPDATE "addresses" SET "village" = '' WHERE "village" IS NULL`
    );

    // Make it NOT NULL after data is populated
    await pool.query(
      `ALTER TABLE "addresses" ALTER COLUMN "village" SET NOT NULL`
    );

    // Remove default constraint
    await pool.query(
      `ALTER TABLE "addresses" ALTER COLUMN "village" DROP DEFAULT`
    );

    console.log("✓ Village column added successfully");
  } catch (error) {
    console.error("Failed to add village column:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addVillageColumn();
