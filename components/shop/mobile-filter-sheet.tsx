"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Search, SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";

export interface MobileFilterSheetProps {
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
}

export function MobileFilterSheet({
  categories,
  brands,
  priceRange,
  currentFilters,
}: MobileFilterSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  // Local state for filters (applied on "Apply Filters" button click)
  const [localCategories, setLocalCategories] = React.useState<string[]>(
    currentFilters.categories
  );
  const [localBrands, setLocalBrands] = React.useState<string[]>(
    currentFilters.brands
  );
  const [localPriceValues, setLocalPriceValues] = React.useState<
    [number, number]
  >([
    currentFilters.minPrice || priceRange.min,
    currentFilters.maxPrice || priceRange.max,
  ]);
  const [localSearchValue, setLocalSearchValue] = React.useState(
    currentFilters.search || ""
  );

  // Update local state when sheet opens or currentFilters change
  React.useEffect(() => {
    if (open) {
      setLocalCategories(currentFilters.categories);
      setLocalBrands(currentFilters.brands);
      setLocalPriceValues([
        currentFilters.minPrice || priceRange.min,
        currentFilters.maxPrice || priceRange.max,
      ]);
      setLocalSearchValue(currentFilters.search || "");
    }
  }, [open, currentFilters, priceRange]);

  // Function to apply filters and update URL
  const applyFilters = () => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));

    // Update category
    params.delete("category");
    if (localCategories.length > 0) {
      localCategories.forEach((cat) => params.append("category", cat));
    }

    // Update brand
    params.delete("brand");
    if (localBrands.length > 0) {
      localBrands.forEach((brand) => params.append("brand", brand));
    }

    // Update price range
    if (localPriceValues[0] !== priceRange.min) {
      params.set("minPrice", String(localPriceValues[0]));
    } else {
      params.delete("minPrice");
    }

    if (localPriceValues[1] !== priceRange.max) {
      params.set("maxPrice", String(localPriceValues[1]));
    } else {
      params.delete("maxPrice");
    }

    // Update search
    if (localSearchValue.trim()) {
      params.set("search", localSearchValue.trim());
    } else {
      params.delete("search");
    }

    // Reset to page 1 when filters change
    params.delete("page");

    router.push(`/shop?${params.toString()}`);
    setOpen(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setLocalCategories([]);
    setLocalBrands([]);
    setLocalPriceValues([priceRange.min, priceRange.max]);
    setLocalSearchValue("");
    router.push("/shop");
    setOpen(false);
  };

  // Handle category checkbox change
  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    setLocalCategories((prev) =>
      checked ? [...prev, categoryName] : prev.filter((c) => c !== categoryName)
    );
  };

  // Handle brand checkbox change
  const handleBrandChange = (brandName: string, checked: boolean) => {
    setLocalBrands((prev) =>
      checked ? [...prev, brandName] : prev.filter((b) => b !== brandName)
    );
  };

  // Calculate active filter count
  const activeFilterCount =
    currentFilters.categories.length +
    currentFilters.brands.length +
    (currentFilters.minPrice !== priceRange.min ? 1 : 0) +
    (currentFilters.maxPrice !== priceRange.max ? 1 : 0) +
    (currentFilters.search ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Refine your product search with filters
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Active Filter Badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentFilters.categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {category}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              {currentFilters.brands.map((brand) => (
                <Badge key={brand} variant="secondary" className="gap-1 pr-1">
                  {brand}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              {currentFilters.search && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  Search: {currentFilters.search}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {(currentFilters.minPrice !== priceRange.min ||
                currentFilters.maxPrice !== priceRange.max) && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  Price: Rp
                  {(
                    currentFilters.minPrice || priceRange.min
                  ).toLocaleString()}{" "}
                  - Rp
                  {(currentFilters.maxPrice || priceRange.max).toLocaleString()}
                  <X className="h-3 w-3" />
                </Badge>
              )}
            </div>
          )}

          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="mobile-search" className="text-sm font-medium">
              Search Products
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="mobile-search"
                type="text"
                placeholder="Search by name..."
                value={localSearchValue}
                onChange={(e) => setLocalSearchValue(e.target.value)}
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
                  const isChecked = localCategories.includes(category.name);
                  return (
                    <div
                      key={category.name}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`mobile-category-${category.name}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(category.name, checked === true)
                        }
                      />
                      <label
                        htmlFor={`mobile-category-${category.name}`}
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
                  const isChecked = localBrands.includes(brand.name);
                  return (
                    <div
                      key={brand.name}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`mobile-brand-${brand.name}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleBrandChange(brand.name, checked === true)
                        }
                      />
                      <label
                        htmlFor={`mobile-brand-${brand.name}`}
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
                  value={localPriceValues}
                  onValueChange={(value) =>
                    setLocalPriceValues(value as [number, number])
                  }
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Rp{localPriceValues[0].toLocaleString()}</span>
                  <span>Rp{localPriceValues[1].toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="w-full"
          >
            Clear All
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
