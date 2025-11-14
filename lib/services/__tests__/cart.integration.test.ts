/**
 * Integration tests for cart flow
 *
 * These tests verify the end-to-end cart functionality including:
 * - Guest user adding items to cart
 * - Authenticated user loading cart
 * - Cart claim on login
 * - Cart operations (add, remove, update quantity)
 * - Error handling and edge cases
 *
 * Requirements: 4, 5, 6
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { cartService } from "@/lib/services/cart.service";
import { db } from "@/lib/db/db";
import {
  carts,
  cartItems,
  products,
  productGroups,
  users,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ProductData } from "@/lib/types/cart.types";
import { nanoid } from "nanoid";
import { randomUUID } from "crypto";

// Test data - generate unique IDs for each test run
// Use crypto.randomUUID() for proper UUID format (database uses UUID type)
const TEST_USER_ID = randomUUID();
const TEST_GUEST_ID = randomUUID();
const TEST_PRODUCT_GROUP_ID = randomUUID();
const TEST_PRODUCT_ID = randomUUID();

// Mock product data - will be updated after product creation
const mockProductData: ProductData = {
  productId: TEST_PRODUCT_ID,
  productGroupId: TEST_PRODUCT_GROUP_ID,
  name: "Test Product",
  sku: "", // Will be set in createTestProduct
  price: 9999, // Price in cents (99.99 dollars)
  stock: 10,
  thumbnailUrl: "https://example.com/test.jpg",
  variantSelections: {},
};

/**
 * Helper function to clean up test data
 */
async function cleanupTestData() {
  try {
    // Delete cart items first (foreign key constraint)
    await db.delete(cartItems).where(eq(cartItems.productId, TEST_PRODUCT_ID));

    // Delete carts (will cascade delete cart items)
    await db.delete(carts).where(eq(carts.userId, TEST_USER_ID));
    await db.delete(carts).where(eq(carts.userId, TEST_GUEST_ID));

    // Delete test product
    await db.delete(products).where(eq(products.id, TEST_PRODUCT_ID));

    // Delete test product group
    await db
      .delete(productGroups)
      .where(eq(productGroups.id, TEST_PRODUCT_GROUP_ID));

    // Delete test users
    await db.delete(users).where(eq(users.id, TEST_USER_ID));
    await db.delete(users).where(eq(users.id, TEST_GUEST_ID));
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Helper function to create test users
 */
async function createTestUsers() {
  // Create test authenticated user
  await db.insert(users).values({
    id: TEST_USER_ID,
    name: "Test User",
    email: `test-user-${nanoid()}@example.com`,
    isConfirmed: true,
    isActive: true,
  });

  // Create test guest user (simulating a guest session)
  await db.insert(users).values({
    id: TEST_GUEST_ID,
    name: "Guest User",
    email: `guest-${nanoid()}@example.com`,
    isConfirmed: false,
    isActive: true,
  });
}

/**
 * Helper function to create test product
 */
async function createTestProduct() {
  // Create product group with unique slug
  await db.insert(productGroups).values({
    id: TEST_PRODUCT_GROUP_ID,
    name: "Test Product Group",
    slug: `test-product-group-${nanoid()}`,
    category: "Test Category",
    brand: "Test Brand",
    description: "Test description",
    images: JSON.stringify([
      { url: "https://example.com/test.jpg", isThumbnail: true },
    ]),
  });

  // Create product with unique SKU
  const sku = `TEST-SKU-${nanoid()}`;
  await db.insert(products).values({
    id: TEST_PRODUCT_ID,
    productGroupId: TEST_PRODUCT_GROUP_ID,
    name: "Test Product",
    sku,
    price: 9999, // Price in cents (99.99 dollars)
    stock: 10,
    isActive: true,
  });

  // Update mock product data with the actual SKU
  mockProductData.sku = sku;
}

describe("Cart Integration Tests", () => {
  beforeEach(async () => {
    await cleanupTestData();
    await createTestUsers();
    await createTestProduct();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe("Guest User Cart Flow", () => {
    it("should allow guest user to add items to cart", async () => {
      // Add item to guest cart
      await cartService.addItem(TEST_GUEST_ID, mockProductData, 2);

      // Load guest cart
      const guestCart = await cartService.getCart(TEST_GUEST_ID);

      // Verify cart has item
      assert.strictEqual(guestCart.length, 1);
      assert.strictEqual(guestCart[0].productId, TEST_PRODUCT_ID);
      assert.strictEqual(guestCart[0].quantity, 2);
      assert.strictEqual(guestCart[0].name, "Test Product");
      assert.strictEqual(guestCart[0].price, 9999);
    });

    it("should return empty cart for guest with no items", async () => {
      // Load cart for guest with no items
      const guestCart = await cartService.getCart(TEST_GUEST_ID);

      // Verify empty cart
      assert.strictEqual(guestCart.length, 0);
      assert.ok(Array.isArray(guestCart));
    });

    it("should increment quantity when guest adds same item twice", async () => {
      // Add item first time
      await cartService.addItem(TEST_GUEST_ID, mockProductData, 2);

      // Add same item again
      await cartService.addItem(TEST_GUEST_ID, mockProductData, 3);

      // Load cart
      const guestCart = await cartService.getCart(TEST_GUEST_ID);

      // Verify quantity was incremented
      assert.strictEqual(guestCart.length, 1);
      assert.strictEqual(guestCart[0].quantity, 5);
    });
  });

  describe("Authenticated User Cart Flow", () => {
    it("should allow authenticated user to add items to cart", async () => {
      // Add item to user cart
      await cartService.addItem(TEST_USER_ID, mockProductData, 1);

      // Load user cart
      const userCart = await cartService.getCart(TEST_USER_ID);

      // Verify cart has item
      assert.strictEqual(userCart.length, 1);
      assert.strictEqual(userCart[0].productId, TEST_PRODUCT_ID);
      assert.strictEqual(userCart[0].quantity, 1);
    });

    it("should load cart for authenticated user", async () => {
      // Add multiple items
      await cartService.addItem(TEST_USER_ID, mockProductData, 2);

      // Load cart
      const userCart = await cartService.getCart(TEST_USER_ID);

      // Verify cart structure
      assert.strictEqual(userCart.length, 1);
      assert.ok(userCart[0].id);
      assert.ok(userCart[0].productId);
      assert.ok(userCart[0].productGroupId);
      assert.ok(userCart[0].name);
      assert.ok(userCart[0].sku);
      assert.strictEqual(typeof userCart[0].price, "number");
      assert.strictEqual(typeof userCart[0].quantity, "number");
      assert.strictEqual(typeof userCart[0].stock, "number");
      assert.strictEqual(typeof userCart[0].addedAt, "number");
      assert.strictEqual(typeof userCart[0].updatedAt, "number");
    });
  });

  describe("Cart Operations", () => {
    it("should remove item from cart", async () => {
      // Add item
      await cartService.addItem(TEST_USER_ID, mockProductData, 2);

      // Get cart to get item ID
      const cart = await cartService.getCart(TEST_USER_ID);
      const itemId = cart[0].id;

      // Remove item
      await cartService.removeItem(TEST_USER_ID, itemId);

      // Verify item removed
      const updatedCart = await cartService.getCart(TEST_USER_ID);
      assert.strictEqual(updatedCart.length, 0);
    });

    it("should update item quantity", async () => {
      // Add item
      await cartService.addItem(TEST_USER_ID, mockProductData, 2);

      // Get cart to get item ID
      const cart = await cartService.getCart(TEST_USER_ID);
      const itemId = cart[0].id;

      // Update quantity
      await cartService.updateQuantity(TEST_USER_ID, itemId, 5);

      // Verify quantity updated
      const updatedCart = await cartService.getCart(TEST_USER_ID);
      assert.strictEqual(updatedCart[0].quantity, 5);
    });

    it("should remove item when quantity updated to zero", async () => {
      // Add item
      await cartService.addItem(TEST_USER_ID, mockProductData, 2);

      // Get cart to get item ID
      const cart = await cartService.getCart(TEST_USER_ID);
      const itemId = cart[0].id;

      // Update quantity to 0
      await cartService.updateQuantity(TEST_USER_ID, itemId, 0);

      // Verify item removed
      const updatedCart = await cartService.getCart(TEST_USER_ID);
      assert.strictEqual(updatedCart.length, 0);
    });

    it("should clear all items from cart", async () => {
      // Add multiple items
      await cartService.addItem(TEST_USER_ID, mockProductData, 2);

      // Clear cart
      await cartService.clearCart(TEST_USER_ID);

      // Verify cart is empty
      const cart = await cartService.getCart(TEST_USER_ID);
      assert.strictEqual(cart.length, 0);
    });
  });

  describe("Cart Claim on Login", () => {
    it("should merge guest cart with user cart on login", async () => {
      // Guest adds items
      await cartService.addItem(TEST_GUEST_ID, mockProductData, 3);

      // User already has items in cart
      await cartService.addItem(TEST_USER_ID, mockProductData, 2);

      // Claim guest cart
      await cartService.claimGuestCart(TEST_GUEST_ID, TEST_USER_ID);

      // Verify quantities merged
      const userCart = await cartService.getCart(TEST_USER_ID);
      assert.strictEqual(userCart.length, 1);
      assert.strictEqual(userCart[0].quantity, 5); // 3 + 2

      // Verify guest cart deleted
      const guestCart = await cartService.getCart(TEST_GUEST_ID);
      assert.strictEqual(guestCart.length, 0);
    });

    it("should transfer guest cart when user has no cart", async () => {
      // Guest adds items
      await cartService.addItem(TEST_GUEST_ID, mockProductData, 3);

      // Claim guest cart (user has no existing cart)
      await cartService.claimGuestCart(TEST_GUEST_ID, TEST_USER_ID);

      // Verify items transferred
      const userCart = await cartService.getCart(TEST_USER_ID);
      assert.strictEqual(userCart.length, 1);
      assert.strictEqual(userCart[0].quantity, 3);

      // Verify guest cart deleted
      const guestCart = await cartService.getCart(TEST_GUEST_ID);
      assert.strictEqual(guestCart.length, 0);
    });

    it("should handle claim when guest cart is empty", async () => {
      // User has items
      await cartService.addItem(TEST_USER_ID, mockProductData, 2);

      // Claim empty guest cart
      await cartService.claimGuestCart(TEST_GUEST_ID, TEST_USER_ID);

      // Verify user cart unchanged
      const userCart = await cartService.getCart(TEST_USER_ID);
      assert.strictEqual(userCart.length, 1);
      assert.strictEqual(userCart[0].quantity, 2);
    });
  });

  describe("Error Handling", () => {
    it("should throw ValidationError when adding item with zero quantity", async () => {
      await assert.rejects(
        async () => {
          await cartService.addItem(TEST_USER_ID, mockProductData, 0);
        },
        {
          name: "ValidationError",
          message: "Quantity must be greater than 0",
        }
      );
    });

    it("should throw ValidationError when adding item with negative quantity", async () => {
      await assert.rejects(
        async () => {
          await cartService.addItem(TEST_USER_ID, mockProductData, -1);
        },
        {
          name: "ValidationError",
          message: "Quantity must be greater than 0",
        }
      );
    });

    it("should throw ValidationError when quantity exceeds stock", async () => {
      await assert.rejects(
        async () => {
          await cartService.addItem(TEST_USER_ID, mockProductData, 100);
        },
        {
          name: "ValidationError",
        }
      );
    });

    it("should throw NotFoundError when removing non-existent item", async () => {
      await assert.rejects(
        async () => {
          await cartService.removeItem(TEST_USER_ID, "non-existent-id");
        },
        {
          name: "NotFoundError",
        }
      );
    });

    it("should throw NotFoundError when updating non-existent item", async () => {
      await assert.rejects(
        async () => {
          await cartService.updateQuantity(TEST_USER_ID, "non-existent-id", 5);
        },
        {
          name: "NotFoundError",
        }
      );
    });

    it("should throw ValidationError when updating quantity exceeds stock", async () => {
      // Add item
      await cartService.addItem(TEST_USER_ID, mockProductData, 2);

      // Get cart to get item ID
      const cart = await cartService.getCart(TEST_USER_ID);
      const itemId = cart[0].id;

      // Try to update to quantity exceeding stock
      await assert.rejects(
        async () => {
          await cartService.updateQuantity(TEST_USER_ID, itemId, 100);
        },
        {
          name: "ValidationError",
        }
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle adding item when stock is exactly equal to quantity", async () => {
      // Add item with quantity equal to stock (10)
      await cartService.addItem(TEST_USER_ID, mockProductData, 10);

      // Verify item added
      const cart = await cartService.getCart(TEST_USER_ID);
      assert.strictEqual(cart[0].quantity, 10);
    });

    it("should validate stock when adding to existing cart item", async () => {
      // Add item with quantity 8
      await cartService.addItem(TEST_USER_ID, mockProductData, 8);

      // Try to add 3 more (total 11, exceeds stock of 10)
      await assert.rejects(
        async () => {
          await cartService.addItem(TEST_USER_ID, mockProductData, 3);
        },
        {
          name: "ValidationError",
        }
      );
    });

    it("should handle clearing empty cart", async () => {
      // Clear cart that doesn't exist
      await cartService.clearCart(TEST_USER_ID);

      // Should not throw error
      const cart = await cartService.getCart(TEST_USER_ID);
      assert.strictEqual(cart.length, 0);
    });

    it("should handle toggle selection for existing item", async () => {
      // Add item
      await cartService.addItem(TEST_USER_ID, mockProductData, 2);

      // Get cart to get item ID
      const cart = await cartService.getCart(TEST_USER_ID);
      const itemId = cart[0].id;

      // Toggle selection (note: current implementation doesn't have selected field)
      await cartService.toggleSelection(TEST_USER_ID, itemId);

      // Should not throw error
      const updatedCart = await cartService.getCart(TEST_USER_ID);
      assert.strictEqual(updatedCart.length, 1);
    });
  });
});
