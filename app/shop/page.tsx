"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Filter, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock product data
const allProducts = [
  {
    id: 1,
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Samsung Galaxy S24",
    brand: "Samsung",
    title: "Samsung Galaxy S24 5G 256GB",
    price: "Rp13.999.000",
    priceValue: 13999000,
    slug: "samsung-galaxy-s24-256gb",
    category: "Gadgets",
    subcategory: "Smartphones",
    popularity: 95,
    dateAdded: new Date("2024-01-15"),
  },
  {
    id: 2,
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Samsung Kulkas 2 Pintu",
    brand: "Samsung",
    title: "Samsung Kulkas 2 Pintu RT38K5032S8",
    price: "Rp6.499.000",
    priceValue: 6499000,
    slug: "samsung-kulkas-2-pintu-rt38k5032s8",
    category: "Home Appliances",
    subcategory: "Refrigerators",
    popularity: 78,
    dateAdded: new Date("2024-02-01"),
  },
  {
    id: 3,
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "iPhone 15 Pro",
    brand: "Apple",
    title: "iPhone 15 Pro 256GB",
    price: "Rp21.999.000",
    priceValue: 21999000,
    slug: "iphone-15-pro-256gb",
    category: "Gadgets",
    subcategory: "Smartphones",
    popularity: 98,
    dateAdded: new Date("2024-01-20"),
  },
  {
    id: 4,
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "MacBook Pro M3",
    brand: "Apple",
    title: "MacBook Pro M3 14-inch 512GB",
    price: "Rp32.999.000",
    priceValue: 32999000,
    slug: "macbook-pro-m3-14-512gb",
    category: "Gadgets",
    subcategory: "Laptops",
    popularity: 89,
    dateAdded: new Date("2024-01-10"),
  },
  {
    id: 5,
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "Sony WH-1000XM5",
    brand: "Sony",
    title: "Sony WH-1000XM5 Wireless Headphones",
    price: "Rp4.999.000",
    priceValue: 4999000,
    slug: "sony-wh-1000xm5-headphones",
    category: "Gadgets",
    subcategory: "Audio",
    popularity: 85,
    dateAdded: new Date("2024-02-10"),
  },
  {
    id: 8,
    imageSrc: "/placeholder.svg?height=256&width=256",
    imageAlt: "LG OLED C3 55",
    brand: "LG",
    title: "LG OLED C3 55-inch 4K Smart TV",
    price: "Rp18.999.000",
    priceValue: 18999000,
    slug: "lg-oled-c3-55-4k-smart-tv",
    category: "Gadgets",
    subcategory: "TVs",
    popularity: 82,
    dateAdded: new Date("2024-01-25"),
  },
];

const PRODUCTS_PER_PAGE = 6;

interface Filters {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
}

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  className?: string;
}

function FilterPanel({
  filters,
  onFiltersChange,
  className,
}: FilterPanelProps) {
  const categories = Array.from(new Set(allProducts.map((p) => p.category)));
  const brands = Array.from(new Set(allProducts.map((p) => p.brand)));
  const maxPrice = Math.max(...allProducts.map((p) => p.priceValue));

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter((c) => c !== category);
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...filters.brands, brand]
      : filters.brands.filter((b) => b !== brand);
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="font-medium mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category, checked as boolean)
                }
              />
              <label
                htmlFor={`category-${category}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Brands</h3>
        <div className="space-y-3">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={filters.brands.includes(brand)}
                onCheckedChange={(checked) =>
                  handleBrandChange(brand, checked as boolean)
                }
              />
              <label
                htmlFor={`brand-${brand}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            max={maxPrice}
            min={0}
            step={100000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Rp{filters.priceRange[0].toLocaleString()}</span>
            <span>Rp{filters.priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          onFiltersChange({
            categories: [],
            brands: [],
            priceRange: [0, maxPrice],
          })
        }
      >
        Clear All Filters
      </Button>
    </div>
  );
}

export default function ShopPage() {
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    brands: [],
    priceRange: [0, Math.max(...allProducts.map((p) => p.priceValue))],
  });

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = allProducts.filter((product) => {
      const categoryMatch =
        filters.categories.length === 0 ||
        filters.categories.includes(product.category);
      const brandMatch =
        filters.brands.length === 0 || filters.brands.includes(product.brand);
      const priceMatch =
        product.priceValue >= filters.priceRange[0] &&
        product.priceValue <= filters.priceRange[1];
      return categoryMatch && brandMatch && priceMatch;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.priceValue - b.priceValue);
        break;
      case "price-high":
        filtered.sort((a, b) => b.priceValue - a.priceValue);
        break;
      case "popularity":
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      case "newest":
      default:
        filtered.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
        break;
    }

    return filtered;
  }, [filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / PRODUCTS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col tracking-tight w-full ">
      <main className="flex-col flex-1 p-4 md:p-8">
        {/* Page Header */}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <h2 className="text-xl font-medium mb-6">Filters</h2>
              <FilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button and Sort */}
            <div className="flex items-center justify-between mb-6">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Sort by:
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredAndSortedProducts.length)} of{" "}
                {filteredAndSortedProducts.length} products
              </p>
            </div>

            {/* Product Grid */}
            {currentProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-3 mb-8">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    imageSrc={product.imageSrc}
                    imageAlt={product.imageAlt}
                    brand={product.brand}
                    title={product.title}
                    price={product.price}
                    slug={product.slug}
                    className="w-full"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">
                  No products found matching your filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleFiltersChange({
                      categories: [],
                      brands: [],
                      priceRange: [
                        0,
                        Math.max(...allProducts.map((p) => p.priceValue)),
                      ],
                    })
                  }
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
