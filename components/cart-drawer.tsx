"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, ChevronUp, ChevronDown, FileText, Package, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface CartItemProps {
  imageSrc: string
  imageAlt: string
  title: string
  variant: string
  material?: string
  price: string
  quantity: number
  onQuantityChange: (id: string, newQuantity: number) => void
  onRemove: (id: string) => void
  id: string
}

function CartItem({
  imageSrc,
  imageAlt,
  title,
  variant,
  material,
  price,
  quantity,
  onQuantityChange,
  onRemove,
  id,
}: CartItemProps) {
  return (
    <div className="flex items-center py-4">
      <div className="relative size-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image src={imageSrc || "/placeholder.svg"} alt={imageAlt} fill className="object-cover" />
      </div>
      <div className="ml-4 flex-1">
        <h3 className="text-base font-medium">{title}</h3>
        <p className="text-sm text-gray-600">{variant}</p>
        {material && <p className="text-sm text-gray-600">{material}</p>}
        <p className="mt-1 text-sm font-semibold">{price}</p>
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

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cartItems, setCartItems] = useState([
    {
      id: "1",
      imageSrc: "/placeholder.svg?height=80&width=80",
      imageAlt: "Positive Vibes Eco Canvas Tote Bag",
      title: "Positive Vibes - Eco Canvas Tote Bag",
      variant: "Sainty Rose",
      material: "Canvas",
      price: "$19.00",
      quantity: 1,
    },
    {
      id: "2",
      imageSrc: "/placeholder.svg?height=80&width=80",
      imageAlt: "Stay Humble Relax Hood - Faded Halo",
      title: "Stay Humble Relax Hood - Faded Halo",
      variant: "Faded Halo",
      material: "S",
      price: "$89.00",
      quantity: 1,
    },
  ])

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setCartItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const handleRemoveItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number.parseFloat(item.price.replace("$", "")) * item.quantity,
    0,
  )
  const discount = 16.2 // Hardcoded discount for now

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Cart Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full flex-col rounded-l-xl bg-white shadow-lg transition-transform duration-300 ease-in-out md:w-[400px]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center space-x-2">
            <div className="flex items-center rounded-md border border-black px-2 py-1">
              <span className="font-bold">Cart</span>
              <span className="ml-1 text-xs font-semibold">{cartItems.length}</span>
            </div>
            <span className="text-lg font-semibold text-gray-400">Recently viewed</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close cart">
            <X className="size-5" />
          </Button>
        </div>

        {/* Shipping Progress */}
        <div className="p-6">
          <p className="text-sm text-gray-700">You are eligible for free shipping.</p>
          <Progress value={75} className="mt-2 h-1.5 [&>*]:bg-black" />
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6">
          {cartItems.map((item) => (
            <CartItem key={item.id} {...item} onQuantityChange={handleQuantityChange} onRemove={handleRemoveItem} />
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t p-6">
          <Tabs defaultValue="order-note" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="order-note" className="flex items-center gap-2">
                <FileText className="size-4" /> Order note
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center gap-2">
                <Package className="size-4" /> Shipping
              </TabsTrigger>
            </TabsList>
            <TabsContent value="order-note" className="mt-4 text-sm text-gray-600">
              Add a note to your order here.
            </TabsContent>
            <TabsContent value="shipping" className="mt-4 text-sm text-gray-600">
              Shipping options will be calculated at checkout.
            </TabsContent>
          </Tabs>

          <div className="mb-4 flex items-center justify-between">
            <span className="text-base font-medium">Saints' Hot Drop</span>
            <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
              -${discount.toFixed(2)}
            </span>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Taxes and{" "}
              <Link href="#" className="underline">
                shipping
              </Link>{" "}
              calculated <br />
              at checkout
            </div>
            <div className="text-lg font-bold">
              Subtotal <br /> ${subtotal.toFixed(2)} AUD
            </div>
          </div>

          <div className="flex gap-4">
            <Button className="flex-1 bg-black py-6 text-lg font-semibold text-white hover:bg-gray-800">
              <Lock className="mr-2 size-5" /> Check out
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-black py-6 text-lg font-semibold text-black hover:bg-gray-100 bg-transparent"
            >
              View cart
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
