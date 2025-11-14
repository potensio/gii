"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMe } from "@/hooks/use-auth";
import { useEffect, useRef } from "react";
import type { CartItem, ProductData } from "@/lib/types/cart.types";

/**
 * Cart Hooks - Consolidated Implementation
 * Following the three-layer architecture pattern from use-products.ts
 * Requirements: 1, 2, 9
 */

// ============================================================================
// Constants
// ============================================================================

const GUEST_SESSION_KEY = "guest_session_id";

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Cart item from database
 */
export interface CartItemResponse extends CartItem {}

/**
 * Product data for adding to cart
 */
export interface ProductDataInput extends ProductData {}

/**
 * API response types
 */
export interface CartResponse {
  success: boolean;
  message: string;
  data: {
    items: CartItem[];
    lastUpdated: number;
    sessionId?: string; // Session ID for guest users (used for cart claim)
  };
}

export interface CartMutationResponse {
  success: boolean;
  message: string;
  data: {
    lastUpdated: number;
  };
}

// ============================================================================
// cartApi Object - Client-side API methods
// ============================================================================

export const cartApi = {
  /**
   * Get cart for current user (guest or authenticated)
   */
  getCart: async (): Promise<CartResponse> => {
    const response = await fetch("/api/cart", {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to load cart");
    }

    return response.json();
  },

  /**
   * Add item to cart
   */
  addItem: async (
    product: ProductData,
    quantity: number
  ): Promise<CartMutationResponse> => {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product, quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add item");
    }

    return response.json();
  },

  /**
   * Remove item from cart
   */
  removeItem: async (itemId: string): Promise<CartMutationResponse> => {
    const response = await fetch(`/api/cart/${itemId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to remove item");
    }

    return response.json();
  },

  /**
   * Update item quantity
   */
  updateQuantity: async (
    itemId: string,
    quantity: number
  ): Promise<CartMutationResponse> => {
    const response = await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update quantity");
    }

    return response.json();
  },

  /**
   * Clear cart
   */
  clearCart: async (): Promise<CartMutationResponse> => {
    const response = await fetch("/api/cart", {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to clear cart");
    }

    return response.json();
  },

  /**
   * Claim guest cart (called on login/signup)
   */
  claimCart: async (guestId: string): Promise<CartMutationResponse> => {
    const response = await fetch("/api/cart/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ guestId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to claim cart");
    }

    return response.json();
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Store guest session ID in localStorage
 * Called when a guest user has items in their cart
 */
function storeGuestSessionId(sessionId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(GUEST_SESSION_KEY, sessionId);
  }
}

/**
 * Get stored guest session ID from localStorage
 * Returns null if not found
 */
function getStoredGuestSessionId(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(GUEST_SESSION_KEY);
  }
  return null;
}

/**
 * Clear guest session ID from localStorage
 * Called after successful cart claim
 */
function clearGuestSessionId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_SESSION_KEY);
  }
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Main cart query hook
 * Fetches cart data for current user (guest or authenticated)
 * Requirements: 2, 5, 8
 */
export function useCart() {
  const { data: userData } = useMe();
  const userId = userData?.data?.id;

  const query = useQuery({
    queryKey: ["cart", userId || "guest"],
    queryFn: () => cartApi.getCart(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s, max 30s
    meta: {
      onError: (error: Error) => {
        toast.error(error.message || "Failed to load cart");
      },
    },
  });

  // Store guest session ID when cart is loaded (for later claim on login)
  useEffect(() => {
    if (!userId && query.data?.data?.sessionId) {
      // Guest user - store session ID for potential cart claim
      storeGuestSessionId(query.data.data.sessionId);
    }
  }, [userId, query.data]);

  return query;
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Add to cart mutation
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      product,
      quantity,
    }: {
      product: ProductData;
      quantity: number;
    }) => cartApi.addItem(product, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item added to cart");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add item");
    },
  });
}

/**
 * Remove from cart mutation
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed from cart");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove item");
    },
  });
}

/**
 * Update quantity mutation
 */
export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateQuantity(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update quantity");
    },
  });
}

/**
 * Clear cart mutation
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart cleared");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clear cart");
    },
  });
}

/**
 * Claim guest cart mutation (used on login/signup)
 * Requirements: 6, 8
 */
export function useClaimCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guestId: string) => cartApi.claimCart(guestId),
    onSuccess: () => {
      // Clear stored guest session ID
      clearGuestSessionId();

      // Invalidate both guest and user cart queries
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      toast.success("Cart merged successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to merge cart");
    },
  });
}

/**
 * Auto-claim cart hook
 * Automatically triggers cart claim when user logs in with a guest cart
 * Requirements: 6, 8
 *
 * This hook should be used in a top-level component (e.g., layout or provider)
 * to automatically detect authentication state changes and claim guest carts.
 */
export function useAutoClaimCart() {
  const { data: userData } = useMe();
  const userId = userData?.data?.id;
  const claimCart = useClaimCart();
  const hasClaimedRef = useRef(false);

  useEffect(() => {
    // Check if user just logged in and has a stored guest session ID
    if (userId && !hasClaimedRef.current) {
      const guestSessionId = getStoredGuestSessionId();

      if (guestSessionId) {
        // User logged in and had a guest cart - claim it
        claimCart.mutate(guestSessionId);
        hasClaimedRef.current = true;
      }
    }

    // Reset flag when user logs out
    if (!userId) {
      hasClaimedRef.current = false;
    }
  }, [userId, claimCart]);
}
