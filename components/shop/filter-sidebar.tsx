"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FilterSidebarProps {
  categories: Array<{ name: string; count: number }>;
  brands: Array<{ name: string; count: number }>;
  priceRange: { min: number; max: number };
  currentFilters: {
    categories: string[];
    brands: string[];
    minPrice: number;
    maxPrice: number;
    search: string;
  };
  className?: string;
}

export function FilterSidebar({
  categories,
  brands,
  priceRange,
  currentFilters,
  className,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for price range slider
  const [priceValues, setPriceValues] = React.useState<[number, number]>([
    currentFilters.minPrice || priceRange.min,
    currentFilters.maxPrice || priceRange.max,
  ]);

  // Local state for search input
  const [searchValue, setSearchValue] = React.useState(
    currentFilters.search || ""
  );

  // Debounced search
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Update local state when currentFilters change
  React.useEffect(() => {
    setPriceValues([
      currentFilters.minPrice || priceRange.min,
      currentFilters.maxPrice || priceRange.max,
    ]);
  }, [currentFilters.minPrice, currentFilters.maxPrice, priceRange]);

  React.useEffect(() => {
    setSearchValue(currentFilters.search || "");
  }, [currentFilters.search]);

  // Function to update URL search params
  const updateFilters = React.useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));

      // Apply updates
      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.delete(key);
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change
      params.delete("page");

      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Handle category checkbox change
  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    const newCategories = checked
      ? [...currentFilters.categories, categoryName]
      : currentFilters.categories.filter((c) => c !== categoryName);

    updateFilters({
      category: newCategories.length > 0 ? newCategories : null,
    });
  };

  // Handle brand checkbox change
  const handleBrandChange = (brandName: string, checked: boolean) => {
    const newBrands = checked
      ? [...currentFilters.brands, brandName]
      : currentFilters.brands.filter((b) => b !== brandName);

    updateFilters({
      brand: newBrands.length > 0 ? newBrands : null,
    });
  };

  // Handle price range change (on commit)
  const handlePriceChange = (values: number[]) => {
    const [min, max] = values;
    setPriceValues([min, max]);
    updateFilters({
      minPrice: min !== priceRange.min ? String(min) : null,
      maxPrice: max !== priceRange.max ? String(max) : null,
    });
  };

  // Handle search input change (debounced)
  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      updateFilters({
        search: value.trim() || null,
      });
    }, 500);
  };

  // Clear all filters
  const clearAllFilters = () => {
    router.push("/shop");
  };

  // Calculate active filter count
  const activeFilterCount =
    currentFilters.categories.length +
    currentFilters.brands.length +
    (currentFilters.minPrice !== priceRange.min ? 1 : 0) +
    (currentFilters.maxPrice !== priceRange.max ? 1 : 0) +
    (currentFilters.search ? 1 : 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Clear All button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Filters</h2>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentFilters.categories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => handleCategoryChange(category, false)}
            >
              {category}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {currentFilters.brands.map((brand) => (
            <Badge
              key={brand}
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => handleBrandChange(brand, false)}
            >
              {brand}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {currentFilters.search && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => {
                setSearchValue("");
                updateFilters({ search: null });
              }}
            >
              Search: {currentFilters.search}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {(currentFilters.minPrice !== priceRange.min ||
            currentFilters.maxPrice !== priceRange.max) && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => {
                setPriceValues([priceRange.min, priceRange.max]);
                updateFilters({ minPrice: null, maxPrice: null });
              }}
            >
              Price: Rp
              {(currentFilters.minPrice || priceRange.min).toLocaleString()} -
              Rp
              {(currentFilters.maxPrice || priceRange.max).toLocaleString()}
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Search Products
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Search by name..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Categories</Label>
          <div className="space-y-2">
            {categories.map((category) => {
              const isChecked = currentFilters.categories.includes(
                category.name
              );
              return (
                <div
                  key={category.name}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`category-${category.name}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleCategoryChange(category.name, checked === true)
                    }
                  />
                  <label
                    htmlFor={`category-${category.name}`}
                    className="flex-1 text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                    <span className="ml-1 text-muted-foreground">
                      ({category.count})
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand Filters */}
      {brands.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Brands</Label>
          <div className="space-y-2">
            {brands.map((brand) => {
              const isChecked = currentFilters.brands.includes(brand.name);
              return (
                <div key={brand.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.name}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleBrandChange(brand.name, checked === true)
                    }
                  />
                  <label
                    htmlFor={`brand-${brand.name}`}
                    className="flex-1 text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {brand.name}
                    <span className="ml-1 text-muted-foreground">
                      ({brand.count})
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Slider */}
      {priceRange.max > priceRange.min && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="space-y-4">
            <Slider
              min={priceRange.min}
              max={priceRange.max}
              step={10000}
              value={priceValues}
              onValueChange={(value) =>
                setPriceValues(value as [number, number])
              }
              onValueCommit={handlePriceChange}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Rp{priceValues[0].toLocaleString()}</span>
              <span>Rp{priceValues[1].toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
