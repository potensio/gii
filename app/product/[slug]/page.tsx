"use client";

import { useState } from "react";
import { SiteFooter } from "@/components/common/site-footer";
import { ProductGallery } from "@/components/product-gallery";
import { ProductDetails } from "@/components/product-details";
import { ProductDescription } from "@/components/product-description";
import { JoinClubSidebar } from "@/components/join-club-sidebar";
import { ProductCarouselSection } from "@/components/product-carousel-section";

// Define a type for product data
interface Product {
  id: string;
  slug: string;
  brand: string;
  title: string;
  price: string;
  afterpayPrice: string;
  images: { src: string; alt: string }[];
  colors: { name: string; hex: string; imageSrc: string }[];
  sizes: string[];
  stock: number;
  description: string;
  fabricFit: string;
  careInstructions: string;
  specifications: {
    iconSrc: string;
    iconAlt: string;
    label: string;
    value: string;
  }[];
}

// Hardcoded product data for demonstration
const productData: Product = {
  id: "1",
  slug: "iphone-15-pro-256gb",
  brand: "Apple",
  title: "iPhone 15 Pro 256GB",
  price: "Rp21.999.000",
  afterpayPrice: "Rp5.499.750", // Cicilan 4x
  images: [
    {
      src: "/placeholder.svg?height=700&width=700",
      alt: "iPhone 15 Pro Tampak Depan",
    },
    {
      src: "/placeholder.svg?height=700&width=700",
      alt: "iPhone 15 Pro Tampak Belakang",
    },
    {
      src: "/placeholder.svg?height=700&width=700",
      alt: "iPhone 15 Pro Detail Kamera",
    },
  ],
  colors: [
    {
      name: "Natural Titanium",
      hex: "#D4CFC7",
      imageSrc: "/placeholder.svg?height=64&width=64",
    },
    {
      name: "Blue Titanium",
      hex: "#506784",
      imageSrc: "/placeholder.svg?height=64&width=64",
    },
    {
      name: "White Titanium",
      hex: "#FFFFFF",
      imageSrc: "/placeholder.svg?height=64&width=64",
    },
    {
      name: "Black Titanium",
      hex: "#1C1C1E",
      imageSrc: "/placeholder.svg?height=64&width=64",
    },
  ],
  sizes: ["128GB", "256GB", "512GB", "1TB"],
  stock: 8,
  description: `iPhone 15 Pro menghadirkan desain titanium yang super ringan, kamera Pro canggih dengan zoom optik hingga 5x, serta chip A17 Pro yang super cepat untuk pengalaman gaming dan produktivitas level dewa.`,
  fabricFit: `Desain ramping dengan layar 6.1 inci Super Retina XDR yang sangat responsif dan nyaman digenggam. Ideal untuk penggunaan sehari-hari hingga kebutuhan profesional.`,
  careInstructions: `Gunakan case dan screen protector. Hindari paparan air meski tahan cipratan. Update iOS secara berkala untuk performa maksimal.`,
  specifications: [
    {
      iconSrc: "/placeholder.svg?height=64&width=64",
      iconAlt: "Chip A17 Pro",
      label: "Chipset",
      value: "A17 Pro – Performa tertinggi di iPhone",
    },
    {
      iconSrc: "/placeholder.svg?height=64&width=64",
      iconAlt: "Camera Icon",
      label: "Kamera",
      value: "48MP Main + Telephoto 5x",
    },
    {
      iconSrc: "/placeholder.svg?height=64&width=64",
      iconAlt: "USB-C Icon",
      label: "Port",
      value: "USB-C (10Gbps)",
    },
    {
      iconSrc: "/placeholder.svg?height=64&width=64",
      iconAlt: "Material Icon",
      label: "Material",
      value: "Titanium Grade 5",
    },
  ],
};

// Hardcoded related products data
const relatedProducts = [
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "iPhone 15 Pro 512GB",
    brand: "Apple",
    title: "iPhone 15 Pro 512GB",
    price: "Rp25.999.000",
    slug: "iphone-15-pro-512gb",
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
    imageAlt: "Apple Watch SE",
    brand: "Apple",
    title: "Apple Watch SE 2nd Gen 44mm GPS",
    price: "Rp4.199.000",
    slug: "apple-watch-se-2nd-gen-44mm",
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
    imageAlt: "Apple Watch SE",
    brand: "Apple",
    title: "Apple Watch SE 2nd Gen 44mm GPS",
    price: "Rp4.199.000",
    slug: "apple-watch-se-2nd-gen-44mm",
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
    imageAlt: "Apple Watch SE",
    brand: "Apple",
    title: "Apple Watch SE 2nd Gen 44mm GPS",
    price: "Rp4.199.000",
    slug: "apple-watch-se-2nd-gen-44mm",
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
    imageAlt: "Apple Watch SE",
    brand: "Apple",
    title: "Apple Watch SE 2nd Gen 44mm GPS",
    price: "Rp4.199.000",
    slug: "apple-watch-se-2nd-gen-44mm",
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Apple Watch SE",
    brand: "Apple",
    title: "Apple Watch SE 2nd Gen 44mm GPS",
    price: "Rp4.199.000",
    slug: "apple-watch-se-2nd-gen-44mm",
  },
];

export default function ProductPage({ params }: { params: { slug: string } }) {
  // In a real application, you would fetch product data based on params.slug
  // For this example, we're using hardcoded data.
  const product = productData;

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 p-8 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="relative">
        <div className="flex flex-col gap-10 md:gap-20 pb-10 md:pb-20">
          {" "}
          <div className="grid md:gap-10 grid-cols-1 lg:grid-cols-7">
            <div className="flex flex-col gap-10 md:gap-20 lg:col-span-4">
              {/* Product Gallery */}
              <ProductGallery images={product.images} />

              {/* Description and Specifications */}
              <ProductDescription
                description={product.description}
                fabricFit={product.fabricFit}
                careInstructions={product.careInstructions}
              />
            </div>

            <div className="hidden lg:flex lg:sticky top-24 h-fit lg:col-span-3">
              <ProductDetails
                brand={product.brand}
                title={product.title}
                price={product.price}
                afterpayPrice={product.afterpayPrice}
                colors={product.colors}
                sizes={product.sizes}
                stock={product.stock}
              />
            </div>
          </div>
          <ProductCarouselSection
            title="Lihat juga"
            products={relatedProducts}
          />
        </div>

        {/* Related Products */}
      </main>
    </div>
  );
}
