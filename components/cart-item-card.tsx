"use client"

import Image from "next/image"
import { ChevronUp, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CartItemCardProps {
  id: string
  imageSrc: string
  imageAlt: string
  title: string
  variant: string
  material?: string
  price: string
  quantity: number
  onQuantityChange: (id: string, newQuantity: number) => void
  onRemove: (id: string) => void
}

export function CartItemCard({
  id,
  imageSrc,
  imageAlt,
  title,
  variant,
  material,
  price,
  quantity,
  onQuantityChange,
  onRemove,
}: CartItemCardProps) {
  return (
    <div className="flex items-start py-6">
      <div className="relative size-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image src={imageSrc || "/placeholder.svg"} alt={imageAlt} fill className="object-cover" />
      </div>
      <div className="ml-4 flex-1">
        <h3 className="text-base font-medium">{title}</h3>
        <p className="text-sm text-gray-600">{variant}</p>
        {material && <p className="text-sm text-gray-600">{material}</p>}
        <p className="mt-1 text-base font-semibold">{price}</p>
      </div>
      <div className="ml-4 flex flex-col items-center">
        <div className="flex flex-col items-center rounded-md border border-gray-300">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onQuantityChange(id, quantity + 1)}
            aria-label="Increase quantity"
          >
            <ChevronUp className="size-4" />
          </Button>
          <span className="text-sm font-medium">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onQuantityChange(id, Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
          >
            <ChevronDown className="size-4" />
          </Button>
        </div>
        <Button
          variant="link"
          className="mt-1 h-auto p-0 text-xs text-gray-600 hover:text-black"
          onClick={() => onRemove(id)}
        >
          Remove
        </Button>
      </div>
    </div>
  )
}
