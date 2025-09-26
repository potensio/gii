"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceInput } from "@/components/ui/price-input";
import { FieldErrors } from "react-hook-form";
import { CreateProductFormData } from "@/lib/schemas/product-form.schema";
import { useBrands, useCategories } from "@/hooks/use-products";

interface ProductInformationSectionProps {
  productName: string;
  onProductNameChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  brand: string;
  onBrandChange: (value: string) => void;
  sku: string;
  onSkuChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  basePrice: string;
  onBasePriceChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  errors?: FieldErrors<CreateProductFormData>;
}

export function ProductInformationSection({
  productName,
  category,
  brand,
  sku,
  description,
  basePrice,
  status,
  onProductNameChange,
  onCategoryChange,
  onBrandChange,
  onSkuChange,
  onDescriptionChange,
  onBasePriceChange,
  onStatusChange,
  errors,
}: ProductInformationSectionProps) {
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  return (
    <section className="space-y-4">
      <h2 className="font-semibold tracking-tight border-b pb-2">
        Informasi Produk
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="productName">Nama Produk</Label>
            <Input
              id="productName"
              placeholder="iPhone 14 Pro Max"
              value={productName}
              onChange={(e) => onProductNameChange(e.target.value)}
              className={errors?.productName ? "border-destructive" : ""}
            />
            {errors?.productName && (
              <p className="text-sm text-destructive">
                {errors.productName.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={category}
              onValueChange={onCategoryChange}
              disabled={categoriesLoading}
            >
              <SelectTrigger
                className={errors?.category ? "border-destructive" : ""}
              >
                <SelectValue
                  placeholder={
                    categoriesLoading
                      ? "Loading categories..."
                      : "Pilih kategori"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((categoryItem) => (
                  <SelectItem key={categoryItem.id} value={categoryItem.id}>
                    {categoryItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.category && (
              <p className="text-sm text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="brand">Merk</Label>
            <Select
              value={brand}
              onValueChange={onBrandChange}
              disabled={brandsLoading}
            >
              <SelectTrigger
                className={errors?.brand ? "border-destructive" : ""}
              >
                <SelectValue
                  placeholder={
                    brandsLoading ? "Loading brands..." : "Pilih brand"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {brands?.map((brandItem) => (
                  <SelectItem key={brandItem.id} value={brandItem.id}>
                    {brandItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.brand && (
              <p className="text-sm text-destructive">{errors.brand.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              placeholder="Nomor SKU"
              value={sku}
              onChange={(e) => onSkuChange(e.target.value)}
              className={errors?.sku ? "border-destructive" : ""}
            />
            {errors?.sku && (
              <p className="text-sm text-destructive">{errors.sku.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Deskripsi Produk</Label>
          <Textarea
            id="description"
            placeholder="iPhone 14 Pro Max 256GB – Deep Purple. Super Retina XDR, kamera Pro 48MP, dan chip A16 Bionic."
            className={`min-h-[80px] ${
              errors?.description ? "border-destructive" : ""
            }`}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
          {errors?.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="basePrice">Harga Dasar</Label>
            <PriceInput
              id="basePrice"
              placeholder="0"
              value={basePrice}
              onChange={onBasePriceChange}
              className={errors?.basePrice ? "border-destructive" : ""}
            />
            {errors?.basePrice && (
              <p className="text-sm text-destructive">
                {errors.basePrice.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger
                className={errors?.status ? "border-destructive" : ""}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
            {errors?.status && (
              <p className="text-sm text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}