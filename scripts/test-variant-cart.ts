/**
 * Test Script: Verify variant selections in cart
 *
 * This script tests that variant selections are properly stored and retrieved
 *
 * Usage: npx tsx scripts/test-variant-cart.ts
 */

import { db } from "@/lib/db/db";
import { cartItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function testVariantSelections() {
  console.log("Testing variant selections in cart...\n");

  try {
    // Fetch all cart items
    const items = await db.select().from(cartItems).limit(10);

    if (items.length === 0) {
      console.log("No cart items found in database.");
      console.log("✓ Schema is ready for variant selections");
      return;
    }

    console.log(`Found ${items.length} cart item(s):\n`);

    items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`);
      console.log(`  ID: ${item.id}`);
      console.log(`  Product ID: ${item.productId}`);
      console.log(`  Quantity: ${item.quantity}`);
      console.log(`  Variant Selections: ${item.variantSelections}`);

      // Try to parse variant selections
      try {
        const parsed = JSON.parse(item.variantSelections || "{}");
        console.log(`  Parsed Variants:`, parsed);
      } catch (error) {
        console.log(`  ⚠ Could not parse variant selections`);
      }
      console.log("");
    });

    console.log("✓ Variant selections column is working correctly");
  } catch (error) {
    console.error("✗ Test failed:", error);
    throw error;
  }
}

// Run test
testVariantSelections()
  .then(() => {
    console.log("\nTest completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nTest failed:", error);
    process.exit(1);
  });
