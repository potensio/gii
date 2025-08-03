"use client";

import Link from "next/link";

import { useState } from "react";
import Image from "next/image";
import {
  Minus,
  Plus,
  Facebook,
  Twitter,
  PinIcon as Pinterest,
  Send,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProductDetailsProps {
  brand: string;
  title: string;
  price: string;
  afterpayPrice: string;
  colors: { name: string; hex: string; imageSrc: string }[];
  sizes: string[];
  stock: number;
}

export function ProductDetails({
  brand,
  title,
  price,
  afterpayPrice,
  colors,
  sizes,
  stock,
}: ProductDetailsProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const stockPercentage = (stock / 10) * 100; // Assuming max stock for progress bar is 10

  return (
    <div className="w-full space-y-6 py-4 pr-10">
      <div className="space-y-2">
        <p className="text-sm uppercase text-gray-500">{brand}</p>
        <h1 className="text-3xl font-semibold tracking-tighter md:text-4xl">
          {title}
        </h1>
      </div>
      <p className="text-2xl font-semibold">{price}</p>

      {/* Color Selection */}
      <div className="space-y-2">
        <p className="text-sm font-medium">
          Color: <span className="font-normal">{selectedColor}</span>
        </p>
        <div className="flex gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              className={cn(
                "relative size-16 overflow-hidden rounded-lg border-2 transition-all hover:border-black",
                selectedColor === color.name
                  ? "border-black"
                  : "border-transparent"
              )}
              onClick={() => setSelectedColor(color.name)}
              aria-label={`Select color ${color.name}`}
            >
              <Image
                src={color.imageSrc || "/placeholder.svg"}
                alt={`Color swatch for ${color.name}`}
                fill
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="space-y-2">
        <p className="text-sm font-medium">
          Size: <span className="font-normal">{selectedSize}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Button
              key={size}
              variant={selectedSize === size ? "default" : "outline"}
              className={cn(
                "min-w-[48px] rounded-md border border-gray-300 px-4 py-2 text-sm",
                selectedSize === size
                  ? "bg-black text-white hover:bg-black"
                  : "bg-white text-black hover:bg-gray-100"
              )}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Stock Indicator */}
      {stock <= 5 && stock > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-red-600">
            Hurry, only {stock} items left in stock!
          </p>
          <Progress
            value={stockPercentage}
            className="h-2 w-full [&>*]:bg-red-600"
          />
        </div>
      )}
      {stock === 0 && (
        <p className="text-sm font-medium text-red-600">Out of stock!</p>
      )}

      {/* Share Icons */}
      <div className="flex space-x-4 pt-4">
        <span className="text-sm font-medium">Share:</span>
        <Link href="#" aria-label="Share on Facebook">
          <Facebook className="size-5 text-gray-600 hover:text-black" />
        </Link>
        <Link href="#" aria-label="Share on X (Twitter)">
          <Twitter className="size-5 text-gray-600 hover:text-black" />
        </Link>
        <Link href="#" aria-label="Share on Pinterest">
          <Pinterest className="size-5 text-gray-600 hover:text-black" />
        </Link>
        <Link href="#" aria-label="Share via Telegram">
          <Send className="size-5 text-gray-600 hover:text-black" />
        </Link>
        <Link href="#" aria-label="Share via Email">
          <Mail className="size-5 text-gray-600 hover:text-black" />
        </Link>
      </div>

      {/* Quantity and Add to Cart */}
      <div className="flex gap-4">
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => handleQuantityChange(-1)}
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </Button>
          <Input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-12 text-center border-x border-gray-300 text-center [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
            aria-label="Product quantity"
          />
          <Button
            variant="secondary"
            size="icon"
            onClick={() => handleQuantityChange(1)}
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <Button className="flex-1 bg-black py-6 text-lg font-semibold text-white hover:bg-gray-800">
          Add to cart
        </Button>
      </div>
    </div>
  );
}
