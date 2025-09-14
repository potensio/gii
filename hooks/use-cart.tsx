"use client";

import { useState, useCallback, useMemo } from "react";
import { CartItemData } from "@/components/cart/cart-item";

// Sample data - nanti bisa diganti dengan API call atau context
const initialCartItems: CartItemData[] = [
  {
    id: "1",
    imageSrc: "/placeholder.svg?height=80&width=80",
    imageAlt: "iPhone 15 Pro",
    title: "iPhone 15 Pro",
    brand: "Apple",
    capacity: "128GB",
    price: 1000000,
    quantity: 1,
    selected: true,
  },
  {
    id: "2",
    imageSrc: "/placeholder.svg?height=80&width=80",
    imageAlt: "Stay Humble Relax Hood - Faded Halo",
    title: "Stay Humble Relax Hood - Faded Halo",
    brand: "Samsung",
    capacity: "128GB",
    price: 1200000,
    quantity: 1,
    selected: true,
  },
];

export interface UseCartReturn {
  // State
  items: CartItemData[];
  selectedItems: CartItemData[];
  totalItems: number;
  totalPrice: number;
  selectedTotalPrice: number;
  selectedCount: number;
  hasSelectedItems: boolean;

  // Actions
  addItem: (item: Omit<CartItemData, "id" | "selected">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleSelection: (id: string, selected: boolean) => void;
  selectAll: () => void;
  deselectAll: () => void;
  removeSelected: () => void;
  clearCart: () => void;
}

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItemData[]>(initialCartItems);

  // Computed values
  const selectedItems = useMemo(
    () => items.filter((item) => item.selected),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const selectedTotalPrice = useMemo(
    () =>
      selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems]
  );

  const selectedCount = useMemo(() => selectedItems.length, [selectedItems]);

  const hasSelectedItems = useMemo(
    () => selectedItems.length > 0,
    [selectedItems]
  );

  // Actions
  const addItem = useCallback(
    (newItem: Omit<CartItemData, "id" | "selected">) => {
      const id = Date.now().toString(); // Simple ID generation
      const item: CartItemData = {
        ...newItem,
        id,
        selected: true,
      };

      setItems((prevItems) => {
        // Check if item already exists
        const existingItemIndex = prevItems.findIndex(
          (existing) =>
            existing.title === item.title && existing.capacity === item.capacity
        );

        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          return prevItems.map((prevItem, index) =>
            index === existingItemIndex
              ? { ...prevItem, quantity: prevItem.quantity + item.quantity }
              : prevItem
          );
        }

        // Add new item
        return [...prevItems, item];
      });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    },
    [removeItem]
  );

  const toggleSelection = useCallback((id: string, selected: boolean) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, selected } : item))
    );
  }, []);

  const selectAll = useCallback(() => {
    setItems((prevItems) =>
      prevItems.map((item) => ({ ...item, selected: true }))
    );
  }, []);

  const deselectAll = useCallback(() => {
    setItems((prevItems) =>
      prevItems.map((item) => ({ ...item, selected: false }))
    );
  }, []);

  const removeSelected = useCallback(() => {
    setItems((prevItems) => prevItems.filter((item) => !item.selected));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return {
    // State
    items,
    selectedItems,
    totalItems,
    totalPrice,
    selectedTotalPrice,
    selectedCount,
    hasSelectedItems,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    toggleSelection,
    selectAll,
    deselectAll,
    removeSelected,
    clearCart,
  };
}

export default useCart;
