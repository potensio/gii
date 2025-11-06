"use client";

import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRODUCT_BRANDS,
  PRODUCT_CATEGORIES,
  ACTIVE_STATUS_FILTER,
  ActiveStatusFilter,
} from "@/lib/enums";

interface ProductFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  brandFilter: string;
  onBrandFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  statusFilter: ActiveStatusFilter;
  onStatusFilterChange: (value: ActiveStatusFilter) => void;
}

export function ProductFilters({
  searchValue,
  onSearchChange,
  brandFilter,
  onBrandFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
}: ProductFiltersProps) {
  return (
    <div className="flex items-center gap-4 py-4">
      <InputGroup>
        <InputGroupInput
          placeholder="Contoh: Produk 1..."
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full"
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
      <Select value={brandFilter} onValueChange={onBrandFilterChange}>
        <SelectTrigger className="max-w-[240px]">
          <SelectValue placeholder="Filter by brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Brand</SelectItem>
          {Object.values(PRODUCT_BRANDS).map((brand) => (
            <SelectItem key={brand.value} value={brand.value}>
              {brand.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="max-w-[240px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kategori</SelectItem>
          {Object.values(PRODUCT_CATEGORIES).map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Aktif */}
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="max-w-[240px]">
          <SelectValue placeholder="Filter status" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(ACTIVE_STATUS_FILTER).map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
