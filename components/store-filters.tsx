"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface FilterOptions {
  inStockOnly: boolean
  priceRange: [number, number]
  colors: string[]
  categories: string[]
  sizes: string[]
}

interface StoreFiltersProps {
  initialFilters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  showFilters: boolean
  toggleFilters: () => void
}

const allColors = [
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Brown", hex: "#A0522D" },
  { name: "Yellow", hex: "#FFD700" },
  { name: "Grey", hex: "#808080" },
  { name: "Dark Brown", hex: "#654321" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Green", hex: "#008000" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Light Blue", hex: "#ADD8E6" },
  { name: "Dark Blue", hex: "#00008B" },
  { name: "Black", hex: "#000000" },
  { name: "Red", hex: "#FF0000" },
  { name: "Burgundy", hex: "#800020" },
]

const allCategories = [
  { name: "Hoodies", count: 25 },
  { name: "Shorts", count: 2 },
  { name: "Sweatshirts", count: 21 },
  { name: "T-Shirts", count: 29 },
  { name: "Track Pants", count: 2 },
]

const allSizes = [
  { name: "XS", count: 46 },
  { name: "S", count: 79 },
  { name: "M", count: 79 },
  { name: "L", count: 79 },
  { name: "XL", count: 79 },
  { name: "2XL", count: 79 },
  { name: "3XL", count: 79 },
  { name: "4XL", count: 36 },
  { name: "5XL", count: 36 },
]

export function StoreFilters({ initialFilters, onFilterChange, showFilters, toggleFilters }: StoreFiltersProps) {
  const [filters, setFilters] = useState(initialFilters)
  const [priceExpanded, setPriceExpanded] = useState(true)
  const [colorExpanded, setColorExpanded] = useState(true)
  const [categoryExpanded, setCategoryExpanded] = useState(true)
  const [sizeExpanded, setSizeExpanded] = useState(true)

  const handleFilterChange = (newValues: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newValues }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const handleColorToggle = (colorName: string) => {
    const newColors = filters.colors.includes(colorName)
      ? filters.colors.filter((c) => c !== colorName)
      : [...filters.colors, colorName]
    handleFilterChange({ colors: newColors })
  }

  const handleCategoryToggle = (categoryName: string) => {
    const newCategories = filters.categories.includes(categoryName)
      ? filters.categories.filter((c) => c !== categoryName)
      : [...filters.categories, categoryName]
    handleFilterChange({ categories: newCategories })
  }

  const handleSizeToggle = (sizeName: string) => {
    const newSizes = filters.sizes.includes(sizeName)
      ? filters.sizes.filter((s) => s !== sizeName)
      : [...filters.sizes, sizeName]
    handleFilterChange({ sizes: newSizes })
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 transform overflow-y-auto border-r bg-white p-6 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:border-r md:shadow-none",
        showFilters ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="mb-6 flex items-center justify-between md:hidden">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="icon" onClick={toggleFilters} aria-label="Hide filters">
          <ChevronUp className="size-5" />
        </Button>
      </div>

      <Button
        variant="outline"
        className="mb-6 w-full justify-start border-black px-4 py-2 text-black hover:bg-black hover:text-white bg-transparent"
        onClick={toggleFilters}
      >
        Hide filters
      </Button>

      {/* In stock only */}
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-medium">In stock only</span>
        <Switch
          checked={filters.inStockOnly}
          onCheckedChange={(checked) => handleFilterChange({ inStockOnly: checked })}
          aria-label="Filter by in stock only"
        />
      </div>

      {/* Price Filter */}
      <div className="mb-6 border-b pb-6">
        <button
          className="flex w-full items-center justify-between text-sm font-medium"
          onClick={() => setPriceExpanded(!priceExpanded)}
          aria-expanded={priceExpanded}
        >
          Price
          {priceExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        {priceExpanded && (
          <div className="mt-4 space-y-4">
            <Slider
              min={0}
              max={200}
              step={1}
              value={filters.priceRange}
              onValueChange={(value) => handleFilterChange({ priceRange: value as [number, number] })}
              className="w-full"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center">
                <span className="text-sm">$</span>
                <Input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => handleFilterChange({ priceRange: [Number(e.target.value), filters.priceRange[1]] })}
                  className="w-20 border-none text-sm"
                  aria-label="Minimum price"
                />
              </div>
              <span className="text-sm text-gray-500">to</span>
              <div className="flex items-center">
                <span className="text-sm">$</span>
                <Input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange({ priceRange: [filters.priceRange[0], Number(e.target.value)] })}
                  className="w-20 border-none text-sm"
                  aria-label="Maximum price"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Color Filter */}
      <div className="mb-6 border-b pb-6">
        <button
          className="flex w-full items-center justify-between text-sm font-medium"
          onClick={() => setColorExpanded(!colorExpanded)}
          aria-expanded={colorExpanded}
        >
          Color
          {colorExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        {colorExpanded && (
          <div className="mt-4 flex flex-wrap gap-2">
            {allColors.map((color) => (
              <button
                key={color.name}
                className={cn(
                  "size-6 rounded-full border-2 transition-all",
                  filters.colors.includes(color.name) ? "border-black" : "border-gray-300",
                )}
                style={{ backgroundColor: color.hex }}
                onClick={() => handleColorToggle(color.name)}
                aria-label={`Select color ${color.name}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6 border-b pb-6">
        <button
          className="flex w-full items-center justify-between text-sm font-medium"
          onClick={() => setCategoryExpanded(!categoryExpanded)}
          aria-expanded={categoryExpanded}
        >
          Category
          {categoryExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        {categoryExpanded && (
          <div className="mt-4 space-y-2">
            {allCategories.map((category) => (
              <div key={category.name} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.name}`}
                  checked={filters.categories.includes(category.name)}
                  onCheckedChange={() => handleCategoryToggle(category.name)}
                />
                <label
                  htmlFor={`category-${category.name}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category.name} ({category.count})
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Size Filter */}
      <div className="mb-6 pb-6">
        <button
          className="flex w-full items-center justify-between text-sm font-medium"
          onClick={() => setSizeExpanded(!sizeExpanded)}
          aria-expanded={sizeExpanded}
        >
          Size
          {sizeExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        {sizeExpanded && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="size-match-all" />
              <label
                htmlFor="size-match-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Match all
              </label>
            </div>
            {allSizes.map((size) => (
              <div key={size.name} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size.name}`}
                  checked={filters.sizes.includes(size.name)}
                  onCheckedChange={() => handleSizeToggle(size.name)}
                />
                <label
                  htmlFor={`size-${size.name}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {size.name} ({size.count})
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
