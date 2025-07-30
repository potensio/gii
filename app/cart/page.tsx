"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Lock, ChevronLeft } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { JoinClubSidebar } from "@/components/join-club-sidebar"
import { CartDrawer } from "@/components/cart-drawer" // Reusing the existing CartDrawer for its state management
import { CartItemCard } from "@/components/cart-item-card"
import { EstimateShippingRates } from "@/components/estimate-shipping-rates"
import { RelatedProductsSection } from "@/components/related-products-section" // Reusing for "You may also like"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

interface CartItem {
  id: string
  imageSrc: string
  imageAlt: string
  title: string
  variant: string
  material?: string
  price: string
  quantity: number
}

const initialCartItems: CartItem[] = [
  {
    id: "1",
    imageSrc: "/placeholder.svg?height=96&width=96",
    imageAlt: "Positive Vibes Eco Canvas Tote Bag",
    title: "Positive Vibes - Eco Canvas Tote Bag",
    variant: "Sainty Rose",
    material: "Canvas",
    price: "$19.00",
    quantity: 1,
  },
  {
    id: "2",
    imageSrc: "/placeholder.svg?height=96&width=96",
    imageAlt: "Stay Humble Relax Hood - Faded Halo",
    title: "Stay Humble Relax Hood - Faded Halo",
    variant: "Faded Halo",
    material: "S",
    price: "$89.00",
    quantity: 1,
  },
]

const youMayAlsoLikeProducts = [
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Positive Vibes Eco Canvas Tote Bag",
    brand: "FLOWERS & SAINTS",
    title: "Positive Vibes - Eco Canvas Tote Bag",
    price: "$19.00",
    slug: "positive-vibes-eco-canvas-tote-bag",
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Stay Humble Relax Hood - Faded Halo",
    brand: "FLOWERS & SAINTS",
    title: "Stay Humble Relax Hood - Faded Hood",
    price: "$89.00",
    slug: "stay-humble-relax-hood-faded-halo",
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Stay Humble Relax Crew - Midnight Cobalt",
    brand: "FLOWERS & SAINTS",
    title: "Stay Humble Relax Crew - Midnight Cobalt",
    price: "$79.00",
    slug: "stay-humble-relax-crew-midnight-cobalt",
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Stay Humble Tee - Saint's Flame",
    brand: "FLOWERS & SAINTS",
    title: "Stay Humble Tee - Saint's Flame",
    price: "$39.00",
    slug: "stay-humble-tee-saints-flame",
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Protect Your Peace Relax Hood - Midnight Cobalt",
    brand: "FLOWERS & SAINTS",
    title: "Protect Your Peace Relax Hood - Midnight Cobalt",
    price: "$99.00",
    slug: "protect-your-peace-relax-hood-midnight-cobalt",
  },
]

export default function CartPage() {
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false) // State for cart drawer, if needed
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)
  const freeShippingThreshold = 100 // Example threshold for free shipping
  const saintsHotDropDiscount = 16.2 // Hardcoded discount from screenshot

  const handleCartClick = () => {
    setIsCartDrawerOpen(true)
  }

  const handleCloseCartDrawer = () => {
    setIsCartDrawerOpen(false)
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setCartItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const handleRemoveItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number.parseFloat(item.price.replace("$", "")) * item.quantity, 0)
  }, [cartItems])

  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal)
  const shippingProgress = (subtotal / freeShippingThreshold) * 100

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader onCartClick={handleCartClick} />
      <main className="flex-1 py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="mb-8 text-5xl font-extrabold md:text-6xl">Your cart</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-2">
              <div className="border-b pb-4">
                {cartItems.length === 0 ? (
                  <p className="text-center text-gray-600">Your cart is empty.</p>
                ) : (
                  cartItems.map((item) => (
                    <CartItemCard
                      key={item.id}
                      {...item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                    />
                  ))
                )}
              </div>

              <div className="mt-8">
                <EstimateShippingRates />
              </div>

              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  asChild
                  className="border-black px-6 py-3 text-black hover:bg-black hover:text-white bg-transparent"
                >
                  <Link href="/store">
                    <ChevronLeft className="mr-2 size-4" />
                    Continue shopping
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-1">
              {amountToFreeShipping > 0 ? (
                <div className="mb-6 text-center">
                  <p className="text-sm text-gray-700">
                    Spend <span className="font-semibold">${amountToFreeShipping.toFixed(2)}</span> more to reach free
                    shipping!
                  </p>
                  <Progress value={shippingProgress} className="mt-2 h-1.5 [&>*]:bg-black" />
                </div>
              ) : (
                <div className="mb-6 text-center">
                  <p className="text-sm font-semibold text-green-600">You are eligible for free shipping!</p>
                  <Progress value={100} className="mt-2 h-1.5 [&>*]:bg-green-600" />
                </div>
              )}

              <div className="mb-4 flex items-center justify-between">
                <span className="text-base font-medium">Saints' Hot Drop</span>
                <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
                  -${saintsHotDropDiscount.toFixed(2)}
                </span>
              </div>

              <div className="mb-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600">
                  Taxes and{" "}
                  <Link href="#" className="underline">
                    shipping
                  </Link>{" "}
                  calculated <br />
                  at checkout
                </div>
                <div className="text-lg font-bold text-right">
                  Subtotal <br /> ${subtotal.toFixed(2)} AUD
                </div>
              </div>

              <div className="mb-6 text-center text-sm text-gray-600">
                <span>or 4 interest-free payments of ${(subtotal / 4).toFixed(2)} with</span>
                <Image
                  src="/placeholder.svg?height=20&width=80"
                  alt="Afterpay"
                  width={80}
                  height={20}
                  className="inline-block ml-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-4 text-gray-500 inline-block"
                  aria-label="Afterpay info"
                >
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

              <div className="mb-6 space-y-4">
                <h3 className="text-sm font-medium">Add a note to your order</h3>
                <Textarea placeholder="Order note" className="min-h-[80px]" />
              </div>

              <div className="space-y-3">
                <Button className="w-full bg-black py-6 text-lg font-semibold text-white hover:bg-gray-800">
                  <Lock className="mr-2 size-5" /> Check out
                </Button>
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
                <Button className="w-full bg-black py-6 text-lg font-semibold text-white hover:bg-gray-800">
                  <Image
                    src="/placeholder.svg?height=24&width=24"
                    alt="Google Pay"
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  G Pay
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-gray-500">We accept</span>
                <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
                <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
                <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
                <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
                <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
                <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
                <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
                <Image src="/placeholder.svg?height=20&width=30" alt="Payment method" width={30} height={20} />
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        <RelatedProductsSection products={youMayAlsoLikeProducts} />
      </main>
      <SiteFooter />
      <JoinClubSidebar />
      <CartDrawer isOpen={isCartDrawerOpen} onClose={handleCloseCartDrawer} />
    </div>
  )
}
