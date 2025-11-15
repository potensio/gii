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
  buttonText = "Bayar Sekarang",
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
    <div className="space-y-4 leading-tight">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-foreground/75 font-medium">Subtotal</span>
          <span className="font-medium">
            Rp{subtotal.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-foreground/75 font-medium">Ongkos Kirim</span>
          <span className="font-medium">
            Rp{shippingCost.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-xl font-semibold">
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
    </div>
  );
}
