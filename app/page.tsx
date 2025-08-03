"use client"; // Ensure page is a client component to manage state

import { useState } from "react"; // Import useState
import { AboutSection } from "@/components/about-section";
import { HeroSection } from "@/components/hero-section";
import { JoinClubSidebar } from "@/components/join-club-sidebar";
import { ProductCarouselSection } from "@/components/product-carousel-section";
import { ProductCategorySection } from "@/components/product-category-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TillDeathBundleSection } from "@/components/till-death-bundle-section";
import { MainNavigation } from "@/components/main-navigation";
import { StoryBanner } from "@/components/story-banner";



export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false); // State for cart drawer

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  const onlyFewPiecesLeftProducts = [
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Samsung Galaxy S24",
      brand: "Samsung",
      title: "Samsung Galaxy S24 5G 256GB",
      price: "Rp13.999.000",
      slug: "samsung-galaxy-s24-256gb",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Samsung Kulkas 2 Pintu",
      brand: "Samsung",
      title: "Samsung Kulkas 2 Pintu RT38K5032S8",
      price: "Rp6.499.000",
      slug: "samsung-kulkas-2-pintu-rt38k5032s8",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "iPhone 15 Pro",
      brand: "Apple",
      title: "iPhone 15 Pro 256GB",
      price: "Rp21.999.000",
      slug: "iphone-15-pro-256gb",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Galaxy Watch 6",
      brand: "Samsung",
      title: "Samsung Galaxy Watch 6 44mm LTE",
      price: "Rp4.499.000",
      slug: "samsung-galaxy-watch-6-44mm-lte",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "iPhone SE 2022",
      brand: "Apple",
      title: "iPhone SE 2022 128GB",
      price: "Rp7.499.000",
      slug: "iphone-se-2022-128gb",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Samsung Galaxy Tab S9",
      brand: "Samsung",
      title: "Samsung Galaxy Tab S9 FE 6GB/128GB",
      price: "Rp6.299.000",
      slug: "samsung-galaxy-tab-s9-fe-128gb",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Apple Watch SE",
      brand: "Apple",
      title: "Apple Watch SE 2nd Gen 44mm GPS",
      price: "Rp4.199.000",
      slug: "apple-watch-se-2nd-gen-44mm",
    },
    {
      imageSrc: "/placeholder.svg?height=256&width=256",
      imageAlt: "Samsung Microwave Grill",
      brand: "Samsung",
      title: "Samsung Microwave Grill ME731K",
      price: "Rp1.199.000",
      slug: "samsung-microwave-grill-me731k",
    },
  ];
  // Removed revenantBundleProducts as it's no longer used

  return (
    <div className="flex min-h-screen flex-col tracking-tight w-full ">
      <SiteHeader /> {/* Pass the handler */}
      <main className="flex-col flex-1">
        {/* Main Navigation */}
        <MainNavigation
          isCartOpen={isCartOpen}
          onCartClick={handleCartClick}
          onCloseCart={handleCloseCart}
        />
        <div className="flex flex-col gap-20">
          {" "}
          <HeroSection />
          <ProductCategorySection />
          <ProductCarouselSection
            title="Terbaru"
            products={onlyFewPiecesLeftProducts}
          />
          <AboutSection />
          <ProductCarouselSection
            title="Paling Laris"
            products={onlyFewPiecesLeftProducts}
          />
          {/* Removed the BundleShowcaseSection for "Revenant Sacred Sand Set" */}
          <TillDeathBundleSection />
          {/* The "Our Story - Protect" section is a large text overlay, not a full section */}
          <StoryBanner />
        </div>
      </main>
      <SiteFooter />
      <JoinClubSidebar />
    </div>
  );
}
