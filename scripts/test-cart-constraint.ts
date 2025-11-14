import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

async function testCartConstraint() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  try {
    console.log("Testing cart identifier constraint...\n");

    // Test 1: Try to insert cart with neither userId nor sessionId (should fail)
    console.log("Test 1: Insert cart with no identifiers (should fail)");
    try {
      await pool.query(`
        INSERT INTO carts (id, last_activity_at, created_at, updated_at)
        VALUES (gen_random_uuid(), NOW(), NOW(), NOW());
      `);
      console.log("❌ FAILED: Should have rejected cart with no identifiers");
    } catch (error: any) {
      if (error.message.includes("carts_identifier_check")) {
        console.log("✓ PASSED: Correctly rejected cart with no identifiers");
      } else {
        console.log("❌ FAILED: Wrong error:", error.message);
      }
    }

    // Test 2: Insert cart with only sessionId (should succeed)
    console.log("\nTest 2: Insert cart with only sessionId (should succeed)");
    try {
      const result = await pool.query(`
        INSERT INTO carts (id, session_id, last_activity_at, created_at, updated_at)
        VALUES (gen_random_uuid(), 'test-session-123', NOW(), NOW(), NOW())
        RETURNING id, session_id, user_id;
      `);
      console.log(
        "✓ PASSED: Successfully created cart with sessionId:",
        result.rows[0]
      );

      // Clean up
      await pool.query(
        `DELETE FROM carts WHERE session_id = 'test-session-123';`
      );
    } catch (error: any) {
      console.log("❌ FAILED:", error.message);
    }

    // Test 3: Insert cart with only userId (should succeed)
    console.log("\nTest 3: Insert cart with only userId (should succeed)");
    try {
      // First, get a valid user ID
      const userResult = await pool.query(`SELECT id FROM users LIMIT 1;`);

      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id;
        const result = await pool.query(
          `
          INSERT INTO carts (id, user_id, last_activity_at, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, NOW(), NOW(), NOW())
          RETURNING id, session_id, user_id;
        `,
          [userId]
        );
        console.log(
          "✓ PASSED: Successfully created cart with userId:",
          result.rows[0]
        );

        // Clean up
        await pool.query(`DELETE FROM carts WHERE id = $1;`, [
          result.rows[0].id,
        ]);
      } else {
        console.log("⚠️  SKIPPED: No users in database to test with");
      }
    } catch (error: any) {
      console.log("❌ FAILED:", error.message);
    }

    console.log("\n✅ Constraint testing complete!");
  } catch (error) {
    console.error("❌ Testing failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

testCartConstraint();
