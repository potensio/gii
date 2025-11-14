/**
 * Cart Utility Functions
 * Provides reusable utilities for cart operations including validation and calculations
 */

import type { CartItem } from "@/lib/types/cart.types";

/**
 * Validate a single cart item
 * Ensures the item has all required fields and valid values
 */
export function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== "object") return false;

  const cartItem = item as Partial<CartItem>;

  return (
    typeof cartItem.id === "string" &&
    cartItem.id.length > 0 &&
    typeof cartItem.productId === "string" &&
    cartItem.productId.length > 0 &&
    typeof cartItem.productGroupId === "string" &&
    cartItem.productGroupId.length > 0 &&
    typeof cartItem.name === "string" &&
    cartItem.name.length > 0 &&
    typeof cartItem.sku === "string" &&
    cartItem.sku.length > 0 &&
    typeof cartItem.price === "number" &&
    cartItem.price >= 0 &&
    typeof cartItem.quantity === "number" &&
    cartItem.quantity > 0 &&
    typeof cartItem.stock === "number" &&
    cartItem.stock >= 0 &&
    (cartItem.thumbnailUrl === null ||
      typeof cartItem.thumbnailUrl === "string") &&
    typeof cartItem.variantSelections === "object" &&
    cartItem.variantSelections !== null &&
    typeof cartItem.addedAt === "number" &&
    cartItem.addedAt > 0 &&
    typeof cartItem.updatedAt === "number" &&
    cartItem.updatedAt > 0
  );
}

/**
 * Validate an array of cart items
 * Filters out invalid items and returns only valid ones
 */
export function validateCartItems(items: unknown[]): CartItem[] {
  if (!Array.isArray(items)) {
    console.warn("[Cart Validation] Expected array, got:", typeof items);
    return [];
  }

  const validItems = items.filter((item) => {
    const isValid = isValidCartItem(item);
    if (!isValid) {
      console.warn("[Cart Validation] Invalid cart item:", item);
    }
    return isValid;
  });

  if (validItems.length !== items.length) {
    console.warn(
      `[Cart Validation] Filtered ${items.length - validItems.length} invalid items`
    );
  }

  return validItems;
}

/**
 * Sanitize cart items by removing invalid entries and enforcing constraints
 * - Removes items with quantity <= 0
 * - Ensures quantity doesn't exceed stock
 * - Validates all required fields
 */
export function sanitizeCartItems(items: CartItem[]): CartItem[] {
  return items
    .filter((item) => {
      // Remove items with invalid quantity
      if (item.quantity <= 0) {
        console.warn(
          `[Cart Sanitize] Removing item with invalid quantity:`,
          item.id
        );
        return false;
      }
      return true;
    })
    .map((item) => {
      // Ensure quantity doesn't exceed stock
      if (item.quantity > item.stock) {
        console.warn(
          `[Cart Sanitize] Adjusting quantity for item ${item.id}: ${item.quantity} -> ${item.stock}`
        );
        return {
          ...item,
          quantity: item.stock,
          updatedAt: Date.now(),
        };
      }
      return item;
    });
}

/**
 * Calculate total price for cart items
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

/**
 * Get total number of items (sum of quantities)
 */
export function getTotalItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Check if cart is empty
 */
export function isCartEmpty(items: CartItem[]): boolean {
  return items.length === 0;
}

/**
 * Calculate subtotal for a cart item
 */
export function calculateItemSubtotal(item: CartItem): number {
  return item.price * item.quantity;
}
