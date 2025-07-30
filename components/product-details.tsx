"use client"

import Link from "next/link"

import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, Facebook, Twitter, PinIcon as Pinterest, Send, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ProductDetailsProps {
  brand: string
  title: string
  price: string
  afterpayPrice: string
  colors: { name: string; hex: string; imageSrc: string }[]
  sizes: string[]
  stock: number
}

export function ProductDetails({ brand, title, price, afterpayPrice, colors, sizes, stock }: ProductDetailsProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name)
  const [selectedSize, setSelectedSize] = useState(sizes[0])
  const [quantity, setQuantity] = useState(1)

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta))
  }

  const stockPercentage = (stock / 10) * 100 // Assuming max stock for progress bar is 10

  return (
    <div className="space-y-6">
      <p className="text-sm uppercase text-gray-500">{brand}</p>
      <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
      <div className="flex items-center justify-between">
        <p className="text-2xl font-semibold">{price}</p>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>or 4 interest-free payments of {afterpayPrice} with</span>
          <Image src="/placeholder.svg?height=20&width=80" alt="Afterpay" width={80} height={20} />
          <Button variant="ghost" size="icon" className="size-4 text-gray-500" aria-label="Afterpay info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-info"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </Button>
        </div>
      </div>

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
                selectedColor === color.name ? "border-black" : "border-transparent",
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
                selectedSize === size ? "bg-black text-white hover:bg-black" : "bg-white text-black hover:bg-gray-100",
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
          <p className="text-sm font-medium text-red-600">Hurry, only {stock} items left in stock!</p>
          <Progress value={stockPercentage} className="h-2 w-full [&>*]:bg-red-600" />
        </div>
      )}
      {stock === 0 && <p className="text-sm font-medium text-red-600">Out of stock!</p>}

      {/* Quantity and Add to Cart */}
      <div className="flex gap-4">
        <div className="flex items-center rounded-md border border-gray-300">
          <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} aria-label="Decrease quantity">
            <Minus className="size-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-16 border-x border-gray-300 text-center [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
            aria-label="Product quantity"
          />
          <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)} aria-label="Increase quantity">
            <Plus className="size-4" />
          </Button>
        </div>
        <Button className="flex-1 bg-black py-6 text-lg font-semibold text-white hover:bg-gray-800">Add to cart</Button>
      </div>

      <Button className="w-full bg-[#603DEB] py-6 text-lg font-semibold text-white hover:bg-[#502DCB]">
        Buy with <span className="ml-1 font-bold">shop</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-1 size-5"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </Button>
      <p className="text-center text-sm text-gray-600">
        <Link href="#" className="underline hover:text-black">
          More payment options
        </Link>
      </p>

      {/* Share Icons */}
      <div className="flex items-center justify-center space-x-4 pt-4">
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
    </div>
  )
}
