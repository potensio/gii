/**
 * Cart API Client
 * Centralized API functions for cart operations
 * Follows the same pattern as orderApi in use-orders.ts
 */

import type { CartItem } from "@/lib/types/cart.types";

// Response types
export interface CartApiResponse {
  success: boolean;
  message: string;
  data: {
    items: CartItem[];
    lastUpdated: number;
  };
}

export interface CartSyncResponse {
  success: boolean;
  message: string;
  data: {
    lastUpdated: number;
  };
}

export interface CartItemValidation {
  itemId: string;
  valid: boolean;
  type?: "OUT_OF_STOCK" | "PRODUCT_UNAVAILABLE" | "PRICE_CHANGED";
  message?: string;
  suggestedAction?: "REMOVE" | "UPDATE_QUANTITY" | "UPDATE_PRICE";
  currentStock?: number;
  currentPrice?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: CartItemValidation[];
}

export interface CartValidateResponse {
  success: boolean;
  message: string;
  data: ValidationResult;
}

/**
 * Centralized cart API functions
 */
export const cartApi = {
  /**
   * Load cart from database (authenticated users only)
   */
  loadCart: async (): Promise<CartApiResponse> => {
    const response = await fetch("/api/cart", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to load cart");
    }

    return response.json();
  },

  /**
   * Sync cart to database (authenticated users only)
   */
  syncCart: async (items: CartItem[]): Promise<CartSyncResponse> => {
    const response = await fetch("/api/cart/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to sync cart");
    }

    return response.json();
  },

  /**
   * Validate cart items against current product data
   * Works for both authenticated and guest users
   */
  validateCart: async (items: CartItem[]): Promise<CartValidateResponse> => {
    const response = await fetch("/api/cart/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to validate cart");
    }

    return response.json();
  },
};
