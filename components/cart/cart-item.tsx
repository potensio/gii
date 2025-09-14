"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";

export interface CartItemData {
  id: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  brand: string;
  capacity?: string;
  price: number;
  quantity: number;
  selected: boolean;
}

interface CartItemProps {
  item: CartItemData;
  variant?: "drawer" | "page";
  selectable?: boolean;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
  onSelectionChange?: (id: string, selected: boolean) => void;
}

export function CartItem({
  item,
  variant = "drawer",
  selectable = false,
  onQuantityChange,
  onRemove,
  onSelectionChange,
}: CartItemProps) {
  const { id, imageSrc, imageAlt, title, capacity, price, quantity, selected } =
    item;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemove(id);
      return;
    }
    onQuantityChange(id, newQuantity);
  };

  const handleSelectionChange = (checked: boolean) => {
    onSelectionChange?.(id, checked);
  };

  const imageSize = variant === "drawer" ? "size-20" : "size-32";
  const containerClasses = cn(
    "flex py-4 gap-4",
    variant === "drawer" ? "gap-4" : "gap-6",
    selected &&
      selectable &&
      "bg-blue-50 border border-blue-200 rounded-lg px-4",
    !selected &&
      selectable &&
      "hover:bg-gray-50 rounded-lg px-4 transition-colors"
  );

  return (
    <div className={containerClasses}>
      {/* Checkbox untuk selection */}
      {selectable && (
        <div className="flex items-start pt-2">
          <Checkbox
            checked={selected}
            onCheckedChange={handleSelectionChange}
            aria-label={`Pilih ${title}`}
          />
        </div>
      )}

      {/* Product Image */}
      <div
        className={cn(
          "relative flex-shrink-0 overflow-hidden rounded-lg bg-gray-100",
          imageSize
        )}
      >
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={imageAlt}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col justify-center gap-4 ml-4 flex-1">
        <div className="flex flex-row justify-between gap-4">
          <div className="flex flex-col gap-1 w-full justify-between">
            <h3
              className={cn(
                "text-medium",
                selected && selectable && "font-semibold"
              )}
            >
              {title}
            </h3>
            {capacity && <p className="text-sm text-gray-500">{capacity}</p>}
          </div>
          <p className="font-medium">Rp{price.toLocaleString("id-ID")}</p>
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-row gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(quantity - 1)}
            aria-label="Kurangi jumlah"
          >
            {quantity > 1 ? (
              <Minus className="size-4" strokeWidth={1.5} />
            ) : (
              <Trash2 className="size-4" strokeWidth={1.5} />
            )}
          </Button>

          <Input
            type="text"
            value={quantity}
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value) || 1;
              if (newQuantity > 0) {
                handleQuantityChange(newQuantity);
              }
            }}
            className="w-8 h-8 border-0 bg-gray-100 text-sm text-center [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
            aria-label="Jumlah produk"
          />

          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(quantity + 1)}
            aria-label="Tambah jumlah"
          >
            <Plus className="size-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
