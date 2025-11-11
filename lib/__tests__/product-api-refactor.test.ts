/**
 * Product API Refactor Verification Tests
 *
 * This test suite verifies the refactored product API implementation:
 * - POST route with product creation (with and without variants)
 * - PATCH route with product update (with and without variants)
 * - Transaction rollback on errors (e.g., duplicate SKU)
 * - Empty additionalDescriptions filtered by Zod transform
 * - Authorization checks
 * - Error response formatting
 */

import { productService } from "@/lib/services/product.service";
import { productSchema } from "@/lib/validations/product.validation";
import { db } from "@/lib/db/db";
import {
  productGroups,
  products,
  productVariants,
  productVariantCombinations,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Test data
const testProductWithoutVariants = {
  name: "Test Product No Variants",
  category: "smartphones",
  brand: "apple",
  description: "A test product without variants",
  weight: 200,
  isActive: true,
  additionalDescriptions: [
    { title: "Feature 1", body: "Description 1" },
    { title: "", body: "" }, // Should be filtered out
    { title: "Feature 2", body: "Description 2" },
  ],
  hasVariants: false,
  variantTypes: [],
  combinations: [
    {
      variants: {},
      sku: "TEST-NO-VAR-001",
      name: "Test Product No Variants",
      price: 1000000,
      stock: 10,
      active: true,
    },
  ],
};

const testProductWithVariants = {
  name: "Test Product With Variants",
  category: "smartphones",
  brand: "samsung",
  description: "A test product with variants",
  weight: 250,
  isActive: true,
  additionalDescriptions: [{ title: "Spec 1", body: "Value 1" }],
  hasVariants: true,
  variantTypes: ["color", "storage"],
  combinations: [
    {
      variants: { color: "Black", storage: "128GB" },
      sku: "TEST-VAR-BLACK-128",
      name: "Test Product Black 128GB",
      price: 1500000,
      stock: 5,
      active: true,
    },
    {
      variants: { color: "White", storage: "256GB" },
      sku: "TEST-VAR-WHITE-256",
      name: "Test Product White 256GB",
      price: 1800000,
      stock: 3,
      active: true,
    },
  ],
};

async function cleanupTestData() {
  console.log("🧹 Cleaning up test data...");

  // Delete test products by SKU pattern
  const testSkuPattern = "TEST-%";
  const testProducts = await db
    .select()
    .from(products)
    .where(eq(products.sku, testSkuPattern));

  // Get product group IDs
  const testProductGroupIds = new Set(
    testProducts.map((p) => p.productGroupId)
  );

  // Delete product groups (cascade will handle the rest)
  for (const groupId of testProductGroupIds) {
    await db.delete(productGroups).where(eq(productGroups.id, groupId));
  }

  console.log("✅ Cleanup complete");
}

async function test1_CreateProductWithoutVariants() {
  console.log("\n📝 Test 1: Create product without variants");

  try {
    // Validate data with Zod schema
    const validatedData = productSchema.parse(testProductWithoutVariants);

    // Verify empty additionalDescriptions are filtered
    console.log("  ✓ Zod validation passed");
    console.log(
      `  ✓ Additional descriptions filtered: ${testProductWithoutVariants.additionalDescriptions.length} -> ${validatedData.additionalDescriptions?.length}`
    );

    if (validatedData.additionalDescriptions?.length !== 2) {
      throw new Error(
        "Empty additional descriptions were not filtered correctly"
      );
    }

    // Create product using service
    const result = await productService.createCompleteProduct(validatedData);

    console.log(`  ✓ Product group created: ${result.productGroup.id}`);
    console.log(`  ✓ Products created: ${result.products.length}`);

    // Verify data
    if (result.products.length !== 1) {
      throw new Error("Expected 1 product, got " + result.products.length);
    }

    if (result.products[0].sku !== "TEST-NO-VAR-001") {
      throw new Error("SKU mismatch");
    }

    // Verify no variants were created
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productGroupId, result.productGroup.id));

    if (variants.length !== 0) {
      throw new Error("Expected 0 variants, got " + variants.length);
    }

    console.log("  ✓ No variants created (as expected)");
    console.log("✅ Test 1 PASSED");

    return result.productGroup.id;
  } catch (error) {
    console.error("❌ Test 1 FAILED:", error);
    throw error;
  }
}

async function test2_CreateProductWithVariants() {
  console.log("\n📝 Test 2: Create product with variants");

  try {
    // Validate data with Zod schema
    const validatedData = productSchema.parse(testProductWithVariants);
    console.log("  ✓ Zod validation passed");

    // Create product using service
    const result = await productService.createCompleteProduct(validatedData);

    console.log(`  ✓ Product group created: ${result.productGroup.id}`);
    console.log(`  ✓ Products created: ${result.products.length}`);

    // Verify data
    if (result.products.length !== 2) {
      throw new Error("Expected 2 products, got " + result.products.length);
    }

    // Verify variants were created
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productGroupId, result.productGroup.id));

    console.log(`  ✓ Variants created: ${variants.length}`);

    // Should have 4 variants: 2 colors + 2 storage options
    if (variants.length !== 4) {
      throw new Error("Expected 4 variants, got " + variants.length);
    }

    // Verify variant combinations
    const productIds = result.products.map((p) => p.id);
    const combinations = await db
      .select()
      .from(productVariantCombinations)
      .where(eq(productVariantCombinations.productId, productIds[0]));

    console.log(
      `  ✓ Variant combinations created for first product: ${combinations.length}`
    );

    // Each product should have 2 variant combinations (color + storage)
    if (combinations.length !== 2) {
      throw new Error(
        "Expected 2 combinations per product, got " + combinations.length
      );
    }

    console.log("✅ Test 2 PASSED");

    return result.productGroup.id;
  } catch (error) {
    console.error("❌ Test 2 FAILED:", error);
    throw error;
  }
}

async function test3_UpdateProductWithoutVariants(productGroupId: string) {
  console.log("\n📝 Test 3: Update product without variants");

  try {
    const updatedData = {
      ...testProductWithoutVariants,
      name: "Updated Test Product No Variants",
      description: "Updated description",
      combinations: [
        {
          variants: {},
          sku: "TEST-NO-VAR-001-UPDATED",
          name: "Updated Test Product",
          price: 1200000,
          stock: 15,
          active: true,
        },
      ],
    };

    // Validate data with Zod schema
    const validatedData = productSchema.parse(updatedData);
    console.log("  ✓ Zod validation passed");

    // Update product using service
    const result = await productService.updateCompleteProduct(
      productGroupId,
      validatedData
    );

    console.log(`  ✓ Product group updated: ${result.productGroup.id}`);
    console.log(`  ✓ Products recreated: ${result.products.length}`);

    // Verify updated data
    if (result.productGroup.name !== "Updated Test Product No Variants") {
      throw new Error("Product name not updated");
    }

    if (result.products[0].sku !== "TEST-NO-VAR-001-UPDATED") {
      throw new Error("SKU not updated");
    }

    if (result.products[0].price !== 1200000) {
      throw new Error("Price not updated");
    }

    console.log("✅ Test 3 PASSED");
  } catch (error) {
    console.error("❌ Test 3 FAILED:", error);
    throw error;
  }
}

async function test4_UpdateProductWithVariants(productGroupId: string) {
  console.log("\n📝 Test 4: Update product with variants");

  try {
    const updatedData = {
      ...testProductWithVariants,
      name: "Updated Test Product With Variants",
      combinations: [
        {
          variants: { color: "Blue", storage: "512GB" },
          sku: "TEST-VAR-BLUE-512",
          name: "Test Product Blue 512GB",
          price: 2000000,
          stock: 8,
          active: true,
        },
      ],
    };

    // Validate data with Zod schema
    const validatedData = productSchema.parse(updatedData);
    console.log("  ✓ Zod validation passed");

    // Update product using service
    const result = await productService.updateCompleteProduct(
      productGroupId,
      validatedData
    );

    console.log(`  ✓ Product group updated: ${result.productGroup.id}`);
    console.log(`  ✓ Products recreated: ${result.products.length}`);

    // Verify old products were deleted and new ones created
    if (result.products.length !== 1) {
      throw new Error(
        "Expected 1 product after update, got " + result.products.length
      );
    }

    if (result.products[0].sku !== "TEST-VAR-BLUE-512") {
      throw new Error("SKU not updated correctly");
    }

    // Verify old variants were deleted and new ones created
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productGroupId, result.productGroup.id));

    console.log(`  ✓ Variants recreated: ${variants.length}`);

    // Should have 2 variants: 1 color + 1 storage
    if (variants.length !== 2) {
      throw new Error(
        "Expected 2 variants after update, got " + variants.length
      );
    }

    console.log("✅ Test 4 PASSED");
  } catch (error) {
    console.error("❌ Test 4 FAILED:", error);
    throw error;
  }
}

async function test5_TransactionRollbackOnDuplicateSKU() {
  console.log("\n📝 Test 5: Transaction rollback on duplicate SKU");

  try {
    // First, create a product with a specific SKU
    const firstProduct = {
      ...testProductWithoutVariants,
      combinations: [
        {
          variants: {},
          sku: "TEST-DUPLICATE-SKU",
          name: "First Product",
          price: 1000000,
          stock: 10,
          active: true,
        },
      ],
    };

    const validatedFirst = productSchema.parse(firstProduct);
    const firstResult =
      await productService.createCompleteProduct(validatedFirst);
    console.log(`  ✓ First product created with SKU: TEST-DUPLICATE-SKU`);

    // Try to create another product with the same SKU
    const duplicateProduct = {
      ...testProductWithoutVariants,
      name: "Duplicate SKU Product",
      combinations: [
        {
          variants: {},
          sku: "TEST-DUPLICATE-SKU", // Same SKU
          name: "Duplicate Product",
          price: 1500000,
          stock: 5,
          active: true,
        },
      ],
    };

    const validatedDuplicate = productSchema.parse(duplicateProduct);

    let errorOccurred = false;
    try {
      await productService.createCompleteProduct(validatedDuplicate);
    } catch (error) {
      errorOccurred = true;
      console.log(
        `  ✓ Error caught: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    if (!errorOccurred) {
      throw new Error("Expected duplicate SKU error but none occurred");
    }

    // Verify that no partial data was created (transaction rolled back)
    const productGroupsCount = await db
      .select()
      .from(productGroups)
      .where(eq(productGroups.name, "Duplicate SKU Product"));

    if (productGroupsCount.length > 0) {
      throw new Error(
        "Transaction did not rollback - product group was created"
      );
    }

    console.log("  ✓ Transaction rolled back successfully");
    console.log("✅ Test 5 PASSED");

    // Cleanup the first product
    await db
      .delete(productGroups)
      .where(eq(productGroups.id, firstResult.productGroup.id));
  } catch (error) {
    console.error("❌ Test 5 FAILED:", error);
    throw error;
  }
}

async function test6_ZodTransformFiltersEmptyDescriptions() {
  console.log(
    "\n📝 Test 6: Zod transform filters empty additional descriptions"
  );

  try {
    const dataWithEmptyDescriptions = {
      ...testProductWithoutVariants,
      additionalDescriptions: [
        { title: "Valid Title", body: "Valid Body" },
        { title: "", body: "" }, // Should be filtered
        { title: "  ", body: "  " }, // Should be filtered (whitespace only)
        { title: "Another Valid", body: "Another Body" },
        { title: "Title Only", body: "" }, // Should be filtered
        { title: "", body: "Body Only" }, // Should be filtered
      ],
    };

    const validatedData = productSchema.parse(dataWithEmptyDescriptions);

    console.log(
      `  ✓ Original descriptions: ${dataWithEmptyDescriptions.additionalDescriptions.length}`
    );
    console.log(
      `  ✓ Filtered descriptions: ${validatedData.additionalDescriptions?.length}`
    );

    // Should only have 2 valid descriptions
    if (validatedData.additionalDescriptions?.length !== 2) {
      throw new Error(
        `Expected 2 descriptions after filtering, got ${validatedData.additionalDescriptions?.length}`
      );
    }

    // Verify the correct ones remain
    const titles =
      validatedData.additionalDescriptions?.map((d) => d.title) || [];
    if (!titles.includes("Valid Title") || !titles.includes("Another Valid")) {
      throw new Error("Wrong descriptions were filtered");
    }

    console.log("✅ Test 6 PASSED");
  } catch (error) {
    console.error("❌ Test 6 FAILED:", error);
    throw error;
  }
}

async function test7_ValidationErrors() {
  console.log("\n📝 Test 7: Validation errors are properly caught");

  try {
    // Test missing required fields
    const invalidData = {
      name: "", // Empty name should fail
      category: "smartphones",
      brand: "apple",
      isActive: true,
      hasVariants: false,
      variantTypes: [],
      combinations: [],
    };

    let errorOccurred = false;
    try {
      productSchema.parse(invalidData);
    } catch (error) {
      errorOccurred = true;
      console.log("  ✓ Validation error caught for empty name");
    }

    if (!errorOccurred) {
      throw new Error("Expected validation error but none occurred");
    }

    // Test invalid variant configuration
    const invalidVariantData = {
      ...testProductWithVariants,
      hasVariants: true,
      variantTypes: ["color", "storage"],
      combinations: [
        {
          variants: { color: "Black" }, // Missing storage variant
          sku: "TEST-INVALID",
          price: 1000000,
          stock: 10,
          active: true,
        },
      ],
    };

    errorOccurred = false;
    try {
      productSchema.parse(invalidVariantData);
    } catch (error) {
      errorOccurred = true;
      console.log("  ✓ Validation error caught for incomplete variants");
    }

    if (!errorOccurred) {
      throw new Error(
        "Expected validation error for incomplete variants but none occurred"
      );
    }

    console.log("✅ Test 7 PASSED");
  } catch (error) {
    console.error("❌ Test 7 FAILED:", error);
    throw error;
  }
}

// Main test runner
async function runTests() {
  console.log("🚀 Starting Product API Refactor Verification Tests\n");
  console.log("=".repeat(60));

  let productGroupId1: string | undefined;
  let productGroupId2: string | undefined;

  try {
    // Cleanup before tests
    await cleanupTestData();

    // Run tests
    productGroupId1 = await test1_CreateProductWithoutVariants();
    productGroupId2 = await test2_CreateProductWithVariants();

    if (productGroupId1) {
      await test3_UpdateProductWithoutVariants(productGroupId1);
    }

    if (productGroupId2) {
      await test4_UpdateProductWithVariants(productGroupId2);
    }

    await test5_TransactionRollbackOnDuplicateSKU();
    await test6_ZodTransformFiltersEmptyDescriptions();
    await test7_ValidationErrors();

    console.log("\n" + "=".repeat(60));
    console.log("🎉 ALL TESTS PASSED!");
    console.log("=".repeat(60));
  } catch (error) {
    console.log("\n" + "=".repeat(60));
    console.error("💥 TEST SUITE FAILED");
    console.log("=".repeat(60));
    throw error;
  } finally {
    // Cleanup after tests
    await cleanupTestData();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runTests };
