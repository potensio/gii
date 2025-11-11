import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

config({ path: ".env" });

async function fixMigrationTracking() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  try {
    console.log("Creating migration tracking table...");

    // Create the __drizzle_migrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `);

    console.log("✓ Migration tracking table created");

    // Read the journal to get migration hashes
    const journalPath = join(
      process.cwd(),
      "lib/db/migrations/meta/_journal.json"
    );
    const journal = JSON.parse(readFileSync(journalPath, "utf-8"));

    console.log("\nMarking existing migrations as applied...");

    // Mark migrations 0000, 0001, and 0002 as applied (since tables exist)
    // We'll skip 0003 so it can be applied fresh
    for (let i = 0; i < journal.entries.length - 1; i++) {
      const entry = journal.entries[i];

      // Check if already recorded
      const existing = await pool.query(
        `SELECT * FROM __drizzle_migrations WHERE hash = $1`,
        [entry.tag]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)`,
          [entry.tag, entry.when]
        );
        console.log(`  ✓ Marked ${entry.tag} as applied`);
      } else {
        console.log(`  - ${entry.tag} already recorded`);
      }
    }

    console.log("\nCurrent migration status:");
    const result = await pool.query(`
      SELECT * FROM __drizzle_migrations ORDER BY created_at;
    `);
    result.rows.forEach((row) => {
      console.log(`  - ${row.hash}`);
    });

    console.log("\n✓ Migration tracking fixed!");
    console.log("You can now run: npx drizzle-kit migrate");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

fixMigrationTracking();
