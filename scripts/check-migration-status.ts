import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

async function checkMigrationStatus() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  try {
    // Check if __drizzle_migrations table exists
    const migrationTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '__drizzle_migrations'
      );
    `);

    console.log(
      "Migration tracking table exists:",
      migrationTableCheck.rows[0].exists
    );

    if (migrationTableCheck.rows[0].exists) {
      // Check which migrations have been applied
      const appliedMigrations = await pool.query(`
        SELECT * FROM __drizzle_migrations ORDER BY created_at;
      `);

      console.log("\nApplied migrations:");
      appliedMigrations.rows.forEach((row) => {
        console.log(`  - ${row.hash} (created: ${row.created_at})`);
      });
    }

    // Check which tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("\nExisting tables:");
    tables.rows.forEach((row) => console.log(`  - ${row.table_name}`));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

checkMigrationStatus();
