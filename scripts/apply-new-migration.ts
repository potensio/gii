import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

config({ path: ".env" });

async function applyNewMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  console.log("Applying new migration...");

  try {
    // Read the new migration file
    const migrationSQL = readFileSync(
      join(process.cwd(), "lib/db/migrations/0001_closed_pepper_potts.sql"),
      "utf-8"
    );

    // Execute the migration
    await pool.query(migrationSQL);

    console.log("✓ Migration applied successfully");
    console.log("  - Added 'images' column to product_groups table");
    console.log("  - Added 'is_highlighted' column to product_groups table");
  } catch (error: any) {
    if (error.code === "42701") {
      // Column already exists
      console.log("✓ Columns already exist - migration already applied");
    } else {
      console.error("Migration failed:", error);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

applyNewMigration();
