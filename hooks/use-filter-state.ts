import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface FilterData {
  categories: Array<{ name: string; count: number }>;
  brands: Array<{ name: string; count: number }>;
  priceRange: { min: number; max: number };
}

export interface FilterValues {
  categories: string[];
  brands: string[];
  minPrice: number;
  maxPrice: number;
  search: string;
}

export interface UseFilterStateOptions {
  mode: "instant" | "deferred";
  data: FilterData;
  currentFilters: FilterValues;
}

export function useFilterState({
  mode,
  data,
  currentFilters,
}: UseFilterStateOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Local state
  const [categories, setCategories] = useState<string[]>(
    currentFilters.categories
  );
  const [brands, setBrands] = useState<string[]>(currentFilters.brands);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    currentFilters.minPrice || data.priceRange.min,
    currentFilters.maxPrice || data.priceRange.max,
  ]);
  const [search, setSearch] = useState(currentFilters.search || "");

  // Sync local state with current filters
  useEffect(() => {
    setCategories(currentFilters.categories);
    setBrands(currentFilters.brands);
    setPriceRange([
      currentFilters.minPrice || data.priceRange.min,
      currentFilters.maxPrice || data.priceRange.max,
    ]);
    setSearch(currentFilters.search || "");
  }, [currentFilters, data.priceRange]);

  // Update URL helper
  const updateURL = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));

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

      params.delete("page");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Category handlers
  const handleCategoryChange = useCallback(
    (categoryName: string, checked: boolean) => {
      const newCategories = checked
        ? [...categories, categoryName]
        : categories.filter((c) => c !== categoryName);

      setCategories(newCategories);

      if (mode === "instant") {
        updateURL({
          category: newCategories.length > 0 ? newCategories : null,
        });
      }
    },
    [categories, mode, updateURL]
  );

  const removeCategory = useCallback(
    (categoryName: string) => {
      handleCategoryChange(categoryName, false);
    },
    [handleCategoryChange]
  );

  // Brand handlers
  const handleBrandChange = useCallback(
    (brandName: string, checked: boolean) => {
      const newBrands = checked
        ? [...brands, brandName]
        : brands.filter((b) => b !== brandName);

      setBrands(newBrands);

      if (mode === "instant") {
        updateURL({
          brand: newBrands.length > 0 ? newBrands : null,
        });
      }
    },
    [brands, mode, updateURL]
  );

  const removeBrand = useCallback(
    (brandName: string) => {
      handleBrandChange(brandName, false);
    },
    [handleBrandChange]
  );

  // Price handlers
  const handlePriceChange = useCallback(
    (values: number[]) => {
      const [min, max] = values;
      setPriceRange([min, max]);

      if (mode === "instant") {
        updateURL({
          minPrice: min !== data.priceRange.min ? String(min) : null,
          maxPrice: max !== data.priceRange.max ? String(max) : null,
        });
      }
    },
    [mode, data.priceRange, updateURL]
  );

  const removePriceRange = useCallback(() => {
    setPriceRange([data.priceRange.min, data.priceRange.max]);
    if (mode === "instant") {
      updateURL({ minPrice: null, maxPrice: null });
    }
  }, [data.priceRange, mode, updateURL]);

  // Search handlers
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);

      if (mode === "instant") {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
          updateURL({
            search: value.trim() || null,
          });
        }, 500);
      }
    },
    [mode, updateURL]
  );

  const removeSearch = useCallback(() => {
    setSearch("");
    if (mode === "instant") {
      updateURL({ search: null });
    }
  }, [mode, updateURL]);

  // Apply filters (for deferred mode)
  const applyFilters = useCallback(() => {
    if (mode === "deferred") {
      const params = new URLSearchParams(Array.from(searchParams.entries()));

      params.delete("category");
      if (categories.length > 0) {
        categories.forEach((cat) => params.append("category", cat));
      }

      params.delete("brand");
      if (brands.length > 0) {
        brands.forEach((brand) => params.append("brand", brand));
      }

      if (priceRange[0] !== data.priceRange.min) {
        params.set("minPrice", String(priceRange[0]));
      } else {
        params.delete("minPrice");
      }

      if (priceRange[1] !== data.priceRange.max) {
        params.set("maxPrice", String(priceRange[1]));
      } else {
        params.delete("maxPrice");
      }

      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }

      params.delete("page");
      router.push(`/shop?${params.toString()}`);
    }
  }, [
    mode,
    categories,
    brands,
    priceRange,
    search,
    data.priceRange,
    router,
    searchParams,
  ]);

  // Clear all filters
  const clearAll = useCallback(() => {
    setCategories([]);
    setBrands([]);
    setPriceRange([data.priceRange.min, data.priceRange.max]);
    setSearch("");
    router.push("/shop");
  }, [data.priceRange, router]);

  // Calculate active filter count
  const activeFilterCount =
    currentFilters.categories.length +
    currentFilters.brands.length +
    (currentFilters.minPrice !== data.priceRange.min ? 1 : 0) +
    (currentFilters.maxPrice !== data.priceRange.max ? 1 : 0) +
    (currentFilters.search ? 1 : 0);

  return {
    // Current values
    values: {
      categories,
      brands,
      priceRange,
      search,
    },
    // Change handlers
    handlers: {
      onCategoryChange: handleCategoryChange,
      onBrandChange: handleBrandChange,
      onPriceChange: handlePriceChange,
      onSearchChange: handleSearchChange,
    },
    // Actions
    actions: {
      removeCategory,
      removeBrand,
      removePriceRange,
      removeSearch,
      applyFilters,
      clearAll,
    },
    // Metadata
    meta: {
      activeFilterCount,
      currentFilters,
    },
  };
}
