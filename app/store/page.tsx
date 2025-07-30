"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { JoinClubSidebar } from "@/components/join-club-sidebar"
import { CartDrawer } from "@/components/cart-drawer"
import { StoreFilters } from "@/components/store-filters"
import { ProductGrid } from "@/components/product-grid"
import { BoldSimpleYoursBanner } from "@/components/bold-simple-yours-banner"
import { RecentlyViewedSection } from "@/components/recently-viewed-section"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  imageSrc: string
  imageAlt: string
  brand: string
  title: string
  price: string
  color?: string
  slug: string
  category: string
  size: string[]
  inStock: boolean
}

const allProducts: Product[] = [
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Protect Your Peace Relax Hood - Midnight Cobalt",
    brand: "FLOWERS & SAINTS",
    title: "Protect Your Peace Relax Hood - Midnight Cobalt",
    price: "$99.00",
    slug: "protect-your-peace-relax-hood-midnight-cobalt",
    category: "Hoodies",
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Protect Your Peace Relax Hood - Moonwash",
    brand: "FLOWERS & SAINTS",
    title: "Protect Your Peace Relax Hood - Moonwash",
    price: "$99.00",
    slug: "protect-your-peace-relax-hood-moonwash",
    category: "Hoodies",
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Protect Your Peace Relax Hood - Faded Halo",
    brand: "FLOWERS & SAINTS",
    title: "Protect Your Peace Relax Hood - Faded Halo",
    price: "$99.00",
    slug: "protect-your-peace-relax-hood-faded-halo",
    category: "Hoodies",
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Protect Your Peace Relax Hood - Covenant Clay",
    brand: "FLOWERS & SAINTS",
    title: "Protect Your Peace Relax Hood - Covenant Clay",
    price: "$99.00",
    slug: "protect-your-peace-relax-hood-covenant-clay",
    category: "Hoodies",
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Scribble Relax Crew - Holy Dune",
    brand: "FLOWERS & SAINTS",
    title: "Scribble Relax Crew - Holy Dune",
    price: "$89.00",
    slug: "scribble-relax-crew-holy-dune",
    category: "Sweatshirts",
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Scribble Relax Crew - Monk Moss",
    brand: "FLOWERS & SAINTS",
    title: "Scribble Relax Crew - Monk Moss",
    price: "$89.00",
    slug: "scribble-relax-crew-monk-moss",
    category: "Sweatshirts",
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Scribble Relax Crew - Midnight Cobalt",
    brand: "FLOWERS & SAINTS",
    title: "Scribble Relax Crew - Midnight Cobalt",
    price: "$89.00",
    slug: "scribble-relax-crew-midnight-cobalt",
    category: "Sweatshirts",
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Scribble Relax Crew - WoodSmoke",
    brand: "FLOWERS & SAINTS",
    title: "Scribble Relax Crew - WoodSmoke",
    price: "$89.00",
    slug: "scribble-relax-crew-woodsmoke",
    category: "Sweatshirts",
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Scribble Relax Crew - Sacred Shadow",
    brand: "FLOWERS & SAINTS",
    title: "Scribble Relax Crew - Sacred Shadow",
    price: "$89.00",
    slug: "scribble-relax-crew-sacred-shadow",
    category: "Sweatshirts",
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Scribble Relax Hood - Midnight Cobalt",
    brand: "FLOWERS & SAINTS",
    title: "Scribble Relax Hood - Midnight Cobalt",
    price: "$99.00",
    slug: "scribble-relax-hood-midnight-cobalt",
    category: "Hoodies",
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Scribble Relax Hood - Charity Pink",
    brand: "FLOWERS & SAINTS",
    title: "Scribble Relax Hood - Charity Pink",
    price: "$99.00",
    slug: "scribble-relax-hood-charity-pink",
    category: "Hoodies",
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Scribble Relax Hood - Sacred Shadow",
    brand: "FLOWERS & SAINTS",
    title: "Scribble Relax Hood - Sacred Shadow",
    price: "$99.00",
    slug: "scribble-relax-hood-sacred-shadow",
    category: "Hoodies",
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Scribble Relax Hood - Moonwash",
    brand: "FLOWERS & SAINTS",
    title: "Scribble Relax Hood - Moonwash",
    price: "$99.00",
    slug: "scribble-relax-hood-moonwash",
    category: "Hoodies",
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    inStock: true,
  },
  // Additional products for other categories/sizes to make filters work
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Essential Tee - Black",
    brand: "FLOWERS & SAINTS",
    title: "Essential Tee - Black",
    price: "$49.00",
    slug: "essential-tee-black",
    category: "T-Shirts",
    size: ["S", "M", "L", "XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Essential Tee - White",
    brand: "FLOWERS & SAINTS",
    title: "Essential Tee - White",
    price: "$49.00",
    slug: "essential-tee-white",
    category: "T-Shirts",
    size: ["S", "M", "L", "XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Track Pants - Grey",
    brand: "FLOWERS & SAINTS",
    title: "Track Pants - Grey",
    price: "$69.00",
    slug: "track-pants-grey",
    category: "Track Pants",
    size: ["M", "L", "XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Shorts - Black",
    brand: "FLOWERS & SAINTS",
    title: "Shorts - Black",
    price: "$59.00",
    slug: "shorts-black",
    category: "Shorts",
    size: ["S", "M", "L"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Positive Vibes Eco Canvas Tote Bag",
    brand: "FLOWERS & SAINTS",
    title: "Positive Vibes - Eco Canvas Tote Bag",
    price: "$19.00",
    slug: "positive-vibes-eco-canvas-tote-bag",
    category: "Accessories", // Assuming accessories for this
    size: ["One Size"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Stay Humble Relax Hood - Faded Halo",
    brand: "FLOWERS & SAINTS",
    title: "Stay Humble Relax Hood - Faded Halo",
    price: "$89.00",
    slug: "stay-humble-relax-hood-faded-halo",
    category: "Hoodies",
    size: ["S", "M", "L", "XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Stay Humble Relax Crew - Midnight Cobalt",
    brand: "FLOWERS & SAINTS",
    title: "Stay Humble Relax Crew - Midnight Cobalt",
    price: "$79.00",
    slug: "stay-humble-relax-crew-midnight-cobalt",
    category: "Sweatshirts",
    size: ["S", "M", "L", "XL"],
    inStock: true,
  },
  {
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Stay Humble Tee - Saint's Flame",
    brand: "FLOWERS & SAINTS",
    title: "Stay Humble Tee - Saint's Flame",
    price: "$39.00",
    slug: "stay-humble-tee-saints-flame",
    category: "T-Shirts",
    size: ["S", "M", "L", "XL"],
    inStock: true,
  },
]

const recentlyViewedProducts = [
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
    title: "Stay Humble Relax Hood - Faded Halo",
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

export default function StorePage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState({
    inStockOnly: false,
    priceRange: [0, 99], // Max price from screenshot
    colors: [],
    categories: [],
    sizes: [],
  })
  const [sortBy, setSortBy] = useState("best-selling")

  const handleCartClick = () => {
    setIsCartOpen(true)
  }

  const handleCloseCart = () => {
    setIsCartOpen(false)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        const price = Number.parseFloat(product.price.replace("$", ""))
        const inPriceRange = price >= filters.priceRange[0] && price <= filters.priceRange[1]
        const inSelectedColors =
          filters.colors.length === 0 || filters.colors.some((color) => product.color?.includes(color))
        const inSelectedCategories = filters.categories.length === 0 || filters.categories.includes(product.category)
        const inSelectedSizes = filters.sizes.length === 0 || filters.sizes.some((size) => product.size.includes(size))
        const inStock = !filters.inStockOnly || product.inStock

        return inPriceRange && inSelectedColors && inSelectedCategories && inSelectedSizes && inStock
      })
      .sort((a, b) => {
        // Basic sorting logic
        if (sortBy === "best-selling") return 0 // No specific sort for best-selling
        if (sortBy === "price-asc")
          return Number.parseFloat(a.price.replace("$", "")) - Number.parseFloat(b.price.replace("$", ""))
        if (sortBy === "price-desc")
          return Number.parseFloat(b.price.replace("$", "")) - Number.parseFloat(a.price.replace("$", ""))
        return 0
      })
  }, [filters, sortBy])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader onCartClick={handleCartClick} />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-8 lg:py-12">
          {/* Breadcrumbs */}
          <nav className="mb-4 text-sm text-gray-600">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="hover:underline">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="font-semibold">Apparel</li>
            </ol>
          </nav>

          <h1 className="mb-8 text-5xl font-extrabold md:text-6xl">Apparel</h1>

          <div className="flex flex-col md:flex-row md:space-x-8">
            {/* Filter Toggle for Mobile */}
            <div className="mb-6 flex items-center justify-between md:hidden">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-black px-4 py-2 text-black hover:bg-black hover:text-white bg-transparent"
                onClick={toggleFilters}
              >
                <Menu className="size-4" />
                Filters
              </Button>
              <Select defaultValue="best-selling" onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best-selling">Best selling</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filters Sidebar */}
            <StoreFilters
              initialFilters={filters}
              onFilterChange={handleFilterChange}
              showFilters={showFilters}
              toggleFilters={toggleFilters}
            />

            {/* Product Grid */}
            <div className="flex-1">
              <div className="mb-6 hidden items-center justify-end md:flex">
                <span className="mr-2 text-sm font-medium">Sort by:</span>
                <Select defaultValue="best-selling" onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Best selling" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best-selling">Best selling</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ProductGrid products={filteredProducts} />
              <div className="mt-12 text-center">
                <Button
                  variant="outline"
                  className="border-black px-8 py-3 text-black hover:bg-black hover:text-white bg-transparent"
                >
                  Show more
                </Button>
              </div>
            </div>
          </div>
        </div>
        <BoldSimpleYoursBanner />
        <RecentlyViewedSection products={recentlyViewedProducts} />
      </main>
      <SiteFooter />
      <JoinClubSidebar />
      <CartDrawer isOpen={isCartOpen} onClose={handleCloseCart} />
    </div>
  )
}
