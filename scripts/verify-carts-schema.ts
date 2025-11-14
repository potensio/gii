import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

async function verifyCartsSchema() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  try {
    console.log("Verifying carts table schema...\n");

    // Check columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'carts'
      ORDER BY ordinal_position;
    `);

    console.log("Columns:");
    columnsResult.rows.forEach((row: any) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      );
    });

    // Check constraints
    const constraintsResult = await pool.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'carts';
    `);

    console.log("\nConstraints:");
    constraintsResult.rows.forEach((row: any) => {
      console.log(`  - ${row.constraint_name}: ${row.constraint_type}`);
    });

    // Check indexes
    const indexesResult = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'carts';
    `);

    console.log("\nIndexes:");
    indexesResult.rows.forEach((row: any) => {
      console.log(`  - ${row.indexname}`);
    });

    console.log("\n✅ Schema verification complete!");
  } catch (error) {
    console.error("❌ Verification failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

verifyCartsSchema();
