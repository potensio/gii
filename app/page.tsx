"use client" // Ensure page is a client component to manage state

import { useState } from "react" // Import useState
import { AboutSection } from "@/components/about-section"
import { BestSellersSection } from "@/components/best-sellers-section"
import { HeroSection } from "@/components/hero-section"
import { JoinClubSidebar } from "@/components/join-club-sidebar"
import { ProductCarouselSection } from "@/components/product-carousel-section"
import { PurposeDrivenSection } from "@/components/purpose-driven-section"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { TillDeathBundleSection } from "@/components/till-death-bundle-section"
import { CartDrawer } from "@/components/cart-drawer" // Import CartDrawer

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false) // State for cart drawer

  const handleCartClick = () => {
    setIsCartOpen(true)
  }

  const handleCloseCart = () => {
    setIsCartOpen(false)
  }

  const onlyFewPiecesLeftProducts = [
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "The Art of Boundaries Relax Crew",
      brand: "FLOWERS & SAINTS",
      title: "The Art of Boundaries Relax Crew - Covenant Clay",
      price: "$99.00",
      slug: "the-art-of-boundaries-relax-crew-covenant-clay",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Stay Humble Relax Hood",
      brand: "FLOWERS & SAINTS",
      title: "Stay Humble Relax Hood - Faded Halo",
      price: "$89.00",
      slug: "stay-humble-relax-hood-faded-halo",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Stay Humble Relax Crew Midnight Cobalt",
      brand: "FLOWERS & SAINTS",
      title: "Stay Humble Relax Crew - Midnight Cobalt",
      price: "$79.00",
      slug: "stay-humble-relax-crew-midnight-cobalt", // This slug matches the detail page
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Stay Humble Relax Crew Faded Halo",
      brand: "FLOWERS & SAINTS",
      title: "Stay Humble Relax Crew - Faded Halo",
      price: "$79.00",
      slug: "stay-humble-relax-crew-faded-halo",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Essential Tee",
      brand: "FLOWERS & SAINTS",
      title: "Essential Tees",
      price: "$49.00",
      slug: "essential-tees",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Relax Crew",
      brand: "FLOWERS & SAINTS",
      title: "Relax Crew",
      price: "$79.00",
      slug: "relax-crew",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Relax Hood",
      brand: "FLOWERS & SAINTS",
      title: "Relax Hood",
      price: "$89.00",
      slug: "relax-hood",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Drink Bottles",
      brand: "FLOWERS & SAINTS",
      title: "Drink Bottles",
      price: "$39.00",
      slug: "drink-bottles",
    },
  ]

  // Removed revenantBundleProducts as it's no longer used

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader onCartClick={handleCartClick} /> {/* Pass the handler */}
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <PurposeDrivenSection />
        <ProductCarouselSection title="Only a Few Pieces Left" products={onlyFewPiecesLeftProducts} />
        <BestSellersSection />
        {/* Removed the BundleShowcaseSection for "Revenant Sacred Sand Set" */}
        <TillDeathBundleSection />
        {/* The "Our Story - Protect" section is a large text overlay, not a full section */}
        <section className="flex h-64 items-center justify-center overflow-hidden bg-white py-16 md:h-96">
          <h2 className="whitespace-nowrap text-center text-6xl font-extrabold uppercase text-black/5 md:text-8xl lg:text-9xl">
            Our Story - Protect
          </h2>
        </section>
      </main>
      <SiteFooter />
      <JoinClubSidebar />
      <CartDrawer isOpen={isCartOpen} onClose={handleCloseCart} /> {/* Add the CartDrawer */}
    </div>
  )
}
