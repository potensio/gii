"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductImage {
  src: string;
  alt: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState("");

  return (
    <div className="grid gap-4 px-4 md:px-10 pt-4 md:pt-6 ">
      {/* Main Image */}
      <div className="relative aspect-square md:aspect-[3/2] overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src="/placeholder.svg"
          alt="Main product image"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="hidden md:flex gap-2 md:gap-4 overflow-x-auto lg:overflow-y-auto">
        {images.map((image, index) => (
          <button
            key={index}
            className={cn(
              "relative size-32 lg:size-40 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all hover:border-black",
              mainImage === image.src ? "border-black" : "border-transparent"
            )}
            onClick={() => setMainImage(image.src)}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              fill
              className="object-cover object-center"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
