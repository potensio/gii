import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

async function verifySchema() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  console.log("Verifying product_groups table schema...\n");

  try {
    const result = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'product_groups'
      ORDER BY ordinal_position;
    `);

    console.log("product_groups columns:");
    console.log("─".repeat(80));
    result.rows.forEach((row: any) => {
      console.log(
        `${row.column_name.padEnd(30)} | ${row.data_type.padEnd(20)} | Default: ${
          row.column_default || "NULL"
        }`
      );
    });
    console.log("─".repeat(80));

    // Check for our new columns
    const hasImages = result.rows.some(
      (row: any) => row.column_name === "images"
    );
    const hasIsHighlighted = result.rows.some(
      (row: any) => row.column_name === "is_highlighted"
    );

    console.log("\n✓ Verification Results:");
    console.log(`  - images column: ${hasImages ? "✓ Present" : "✗ Missing"}`);
    console.log(
      `  - is_highlighted column: ${hasIsHighlighted ? "✓ Present" : "✗ Missing"}`
    );
  } catch (error) {
    console.error("Verification failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifySchema();
