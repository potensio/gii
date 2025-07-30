"use client"

import { useRef } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductCard } from "./product-card"

interface Product {
  imageSrc: string
  imageAlt: string
  brand: string
  title: string
  price: string
  slug: string // Add slug
}

interface ProductCarouselSectionProps {
  title: string
  products: Product[]
}

export function ProductCarouselSection({ title, products }: ProductCarouselSectionProps) {
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
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-4xl font-extrabold">{title}</h2>
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
      <div ref={scrollRef} className="flex space-x-6 overflow-x-scroll pb-4 scrollbar-hide">
        {products.map((product, index) => (
          <ProductCard key={index} {...product} />
        ))}
      </div>
    </section>
  )
}
