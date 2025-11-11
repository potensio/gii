import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

config({ path: ".env" });

async function markBaselineMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  try {
    console.log("Setting up migration baseline...\n");

    // Drop the old tracking table if it exists
    await pool.query(`DROP TABLE IF EXISTS __drizzle_migrations CASCADE;`);
    console.log("✓ Cleaned up old migration tracking");

    // Create the proper drizzle migrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `);
    console.log("✓ Created migration tracking table");

    // Read the journal to get the new migration hash
    const journalPath = join(
      process.cwd(),
      "lib/db/migrations/meta/_journal.json"
    );
    const journal = JSON.parse(readFileSync(journalPath, "utf-8"));

    if (journal.entries.length > 0) {
      const baselineMigration = journal.entries[0];

      // Mark the baseline migration as applied (since all tables already exist)
      await pool.query(
        `INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)`,
        [baselineMigration.tag, baselineMigration.when]
      );

      console.log(
        `✓ Marked baseline migration as applied: ${baselineMigration.tag}`
      );
    }

    console.log("\n✓ Migration baseline established!");
    console.log("Your database is now in sync with the schema.");
    console.log(
      "Future schema changes can be applied with: npx drizzle-kit generate && npx tsx scripts/run-migration.ts"
    );
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

markBaselineMigration();
