import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { config } from "dotenv";

config({ path: ".env" });

async function runMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle({ client: pool });

  try {
    console.log("Running migrations...");

    await migrate(db, { migrationsFolder: "./lib/db/migrations" });

    console.log("✓ All migrations applied successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();
