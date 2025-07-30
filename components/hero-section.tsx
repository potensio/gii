"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const heroImages = [
  {
    src: "/placeholder.svg?height=700&width=1400",
    alt: "Hero Image 1: Woman in hoodie with plants",
    text: "Ramping, ringan, sangat bertenaga",
  },
  {
    src: "/placeholder.svg?height=700&width=1400",
    alt: "Hero Image 2: Abstract pattern",
    text: "Pendingin hemar listrik yang pintar",
  },
  {
    src: "/placeholder.svg?height=700&width=1400",
    alt: "Hero Image 3: Urban streetwear",
    text: "Bentuk rutinitas & waktu tidur yang sehat",
  },
]

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 5000) // Change image every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + heroImages.length) % heroImages.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
  }

  return (
    <section className="relative flex justify-center overflow-hidden py-8">
      {/* This div acts as the viewport for the slider, ensuring it's centered and has rounded corners */}
      <div className="relative h-[600px] w-full max-w-[1400px] md:h-[700px]">
        {/* This div contains all the slides and will be translated horizontally */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {heroImages.map((image, index) => (
            <div
              key={index}
              className="relative h-full w-full flex-shrink-0 p-4" // Add padding to create visual gap between slides
            >
              {/* Inner div for the actual image and overlay, applying the rounded corners and overflow-hidden */}
              <div className="relative h-full w-full overflow-hidden rounded-3xl">
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                />
                <div className="absolute inset-0 rounded-3xl bg-black/20" />
                <div className="relative z-10 flex h-full flex-col items-start justify-end p-8 md:p-16">
                  <h1 className="text-4xl font-semibold tracking-tighter leading-tight text-white md:text-4xl lg:text-5xl">
                    {image.text}
                  </h1>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows - positioned absolutely and vertically centered */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-8 top-1/2 -translate-y-1/2 z-20 rounded-full border-white bg-transparent text-white hover:bg-white hover:text-black"
          onClick={goToPrevious}
          aria-label="Previous slide"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-8 top-1/2 -translate-y-1/2 z-20 rounded-full border-white bg-transparent text-white hover:bg-white hover:text-black"
          onClick={goToNext}
          aria-label="Next slide"
        >
          <ArrowRight className="size-5" />
        </Button>

        {/* Navigation Dots - positioned absolutely at the bottom and horizontally centered */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2 md:bottom-16">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={cn(
                "size-2 rounded-full bg-white transition-all duration-300",
                index === currentIndex ? "scale-125 opacity-100" : "opacity-50",
              )}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
