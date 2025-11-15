"use client";

import { useMemo } from "react";
import { CartItem } from "@/lib/types/cart.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface OrderSummaryCardProps {
  cartItems: CartItem[];
  onCheckout: () => void;
  isSubmitting: boolean;
  disabled: boolean;
  buttonText?: string;
}

export function OrderSummaryCard({
  cartItems,
  onCheckout,
  isSubmitting,
  disabled,
  buttonText = "Buat Pesanan",
}: OrderSummaryCardProps) {
  const totalCartItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const shippingCost = 15000; // Fixed shipping cost
  const total = subtotal + shippingCost;

  const hasCartItems = cartItems.length > 0;
  const isDisabled = !hasCartItems || disabled || isSubmitting;

  return (
    <Card className="p-6 sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Produk</span>
          <span className="font-medium">{totalCartItems} item</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">
            Rp{subtotal.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ongkos Kirim</span>
          <span className="font-medium">
            Rp{shippingCost.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      <div className="border-t pt-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-xl font-bold">
            Rp{total.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={isDisabled}
        onClick={onCheckout}
      >
        {isSubmitting ? "Memproses..." : buttonText}
      </Button>
    </Card>
  );
}
