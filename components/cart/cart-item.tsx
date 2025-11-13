"use client";

import { useState, useEffect } from "react";
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

  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      setIsRemoving(true);
      setTimeout(() => {
        onRemove(id);
      }, 300);
      return;
    }
    setIsUpdating(true);
    onQuantityChange(id, newQuantity);
    setTimeout(() => setIsUpdating(false), 300);
  };

  const handleSelectionChange = (checked: boolean) => {
    onSelectionChange?.(id, checked);
  };

  const imageSize = variant === "drawer" ? "size-20" : "size-24 md:size-32";
  const containerClasses = cn(
    "flex py-3 md:py-4 gap-3 md:gap-4 transition-all duration-300 ease-in-out",
    variant === "drawer" ? "gap-4" : "gap-4 md:gap-6",
    selected &&
      selectable &&
      "bg-blue-50 border border-blue-200 rounded-lg px-3 md:px-4",
    !selected &&
      selectable &&
      "hover:bg-gray-50 rounded-lg px-3 md:px-4 transition-colors",
    isRemoving && "opacity-0 scale-95 h-0 py-0 overflow-hidden",
    isUpdating && "scale-[0.99]"
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
      <div className="flex flex-col justify-center gap-3 md:gap-4 ml-2 md:ml-4 flex-1 min-w-0">
        <div className="flex flex-row justify-between gap-2 md:gap-4">
          <div className="flex flex-col gap-1 w-full justify-between min-w-0">
            <h3
              className={cn(
                "text-sm md:text-base truncate",
                selected && selectable && "font-semibold"
              )}
            >
              {title}
            </h3>
            {/* Only show capacity in page variant */}
            {variant === "page" && capacity && (
              <p className="text-xs md:text-sm text-gray-500">{capacity}</p>
            )}
          </div>
          <p className="font-medium text-sm md:text-base whitespace-nowrap">
            Rp{price.toLocaleString("id-ID")}
          </p>
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
