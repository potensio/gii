"use client"

import { useState, useRef } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "./product-card"

interface Product {
  imageSrc: string
  imageAlt: string
  brand: string
  title: string
  price: string
  color?: string
  slug: string // Add slug
}

const allProducts: Record<string, Product[]> = {
  "drink-bottles": [
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Cats Doodle Bottle",
      brand: "FLOWERS & SAINTS",
      title: "Cats Doodle - Bottle",
      price: "$39.00",
      color: "#F0F0F0", // Light gray/white
      slug: "cats-doodle-bottle",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Cosmic Trip Bottle",
      brand: "FLOWERS & SAINTS",
      title: "Cosmic Trip - Bottle",
      price: "$39.00",
      color: "#333366", // Dark blue
      slug: "cosmic-trip-bottle",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Stealth Edition Bottle",
      brand: "FLOWERS & SAINTS",
      title: "Flowers & Saints Signature Bottle – Stealth Edition",
      price: "$39.00",
      color: "#333333", // Dark gray/black
      slug: "flowers-saints-signature-bottle-stealth-edition",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Meow Mode Bottle",
      brand: "FLOWERS & SAINTS",
      title: "Meow Mode - Bottle",
      price: "$39.00",
      color: "#FFC0CB", // Pink
      slug: "meow-mode-bottle",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Abstract Pattern Bottle",
      brand: "FLOWERS & SAINTS",
      title: "Abstract Pattern - Bottle",
      price: "$39.00",
      color: "#A0A0A0",
      slug: "abstract-pattern-bottle",
    },
  ],
  "essential-tees": [
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Essential Tee 1",
      brand: "FLOWERS & SAINTS",
      title: "Essential Tee - Black",
      price: "$49.00",
      slug: "essential-tee-black",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Essential Tee 2",
      brand: "FLOWERS & SAINTS",
      title: "Essential Tee - White",
      price: "$49.00",
      slug: "essential-tee-white",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Essential Tee 3",
      brand: "FLOWERS & SAINTS",
      title: "Essential Tee - Grey",
      price: "$49.00",
      slug: "essential-tee-grey",
    },
  ],
  "tote-bags": [
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Canvas Tote Bag 1",
      brand: "FLOWERS & SAINTS",
      title: "Canvas Tote - Natural",
      price: "$29.00",
      slug: "canvas-tote-natural",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Canvas Tote Bag 2",
      brand: "FLOWERS & SAINTS",
      title: "Canvas Tote - Black",
      price: "$29.00",
      slug: "canvas-tote-black",
    },
  ],
}

export function BestSellersSection() {
  const [activeTab, setActiveTab] = useState("drink-bottles")

  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300 // Adjust as needed
      if (direction === "left") {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  return (
    <section className="container mx-auto px-4 py-16 md:px-8 lg:py-24">
      <h2 className="mb-8 text-4xl font-extrabold">Best Sellers</h2>
      <Tabs defaultValue="drink-bottles" onValueChange={setActiveTab}>
        <div className="mb-8 flex items-center justify-between">
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger
              value="drink-bottles"
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Drink Bottles
            </TabsTrigger>
            <TabsTrigger
              value="essential-tees"
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Essential Tees
            </TabsTrigger>
            <TabsTrigger
              value="tote-bags"
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Tote Bags
            </TabsTrigger>
          </TabsList>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-300 bg-transparent"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-300 bg-transparent"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>

        <TabsContent value="drink-bottles" className="mt-0">
          <div ref={scrollRef} className="flex space-x-6 overflow-x-scroll pb-4 scrollbar-hide">
            {allProducts["drink-bottles"].map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="essential-tees" className="mt-0">
          <div ref={scrollRef} className="flex space-x-6 overflow-x-scroll pb-4 scrollbar-hide">
            {allProducts["essential-tees"].map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="tote-bags" className="mt-0">
          <div ref={scrollRef} className="flex space-x-6 overflow-x-scroll pb-4 scrollbar-hide">
            {allProducts["tote-bags"].map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
