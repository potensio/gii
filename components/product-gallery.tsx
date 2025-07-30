"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductImage {
  src: string
  alt: string
}

interface ProductGalleryProps {
  images: ProductImage[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0]?.src || "/placeholder.svg")

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Main Image */}
      <div className="relative h-[500px] w-full overflow-hidden rounded-xl bg-gray-100 md:h-[600px] lg:h-[700px] lg:w-3/4">
        <Image
          src={mainImage || "/placeholder.svg"}
          alt="Main product image"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto lg:flex-col lg:overflow-y-auto lg:w-1/4">
        {images.map((image, index) => (
          <button
            key={index}
            className={cn(
              "relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all hover:border-black lg:h-32 lg:w-32",
              mainImage === image.src ? "border-black" : "border-transparent",
            )}
            onClick={() => setMainImage(image.src)}
            aria-label={`View image ${index + 1}`}
          >
            <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover object-center" />
          </button>
        ))}
      </div>
    </div>
  )
}
