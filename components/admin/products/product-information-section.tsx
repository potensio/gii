"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceInput } from "@/components/ui/price-input";
import {
  FieldErrors,
  UseFormRegister,
  Control,
  Controller,
} from "react-hook-form";
import { CreateProductFormData } from "@/lib/schemas/product-form.schema";
import { useBrands, useCategories } from "@/hooks/use-products";

interface ProductInformationSectionProps {
  register: UseFormRegister<CreateProductFormData>;
  control: Control<CreateProductFormData>;
  errors?: FieldErrors<CreateProductFormData>;
  hasVariants?: boolean;
  onHasVariantsChange?: (value: boolean) => void;
}

export function ProductInformationSection({
  register,
  control,
  errors,
  hasVariants,
  onHasVariantsChange,
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
              {...register("productName")}
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
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
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
              )}
            />
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
            <Controller
              name="brand"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
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
              )}
            />
            {errors?.brand && (
              <p className="text-sm text-destructive">{errors.brand.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Label htmlFor="hasVariants">Has Variants</Label>
              <Controller
                name="hasVariants"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="hasVariants"
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      onHasVariantsChange?.(checked);
                    }}
                  />
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Toggle to enable product variants with different attributes
            </p>
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
            {...register("description")}
          />
          {errors?.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Simple Product Fields - Only show when hasVariants is false */}
        {!hasVariants && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium text-sm text-muted-foreground">
              Simple Product Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="simplePrice">Price</Label>
                <Controller
                  name="simplePrice"
                  control={control}
                  render={({ field }) => (
                    <PriceInput
                      id="simplePrice"
                      placeholder="0"
                      value={field.value}
                      onChange={field.onChange}
                      className={
                        errors?.simplePrice ? "border-destructive" : ""
                      }
                    />
                  )}
                />
                {errors?.simplePrice && (
                  <p className="text-sm text-destructive">
                    {errors.simplePrice.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="simpleStock">Stock</Label>
                <Input
                  id="simpleStock"
                  type="number"
                  placeholder="0"
                  {...register("simpleStock")}
                  className={errors?.simpleStock ? "border-destructive" : ""}
                />
                {errors?.simpleStock && (
                  <p className="text-sm text-destructive">
                    {errors.simpleStock.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="simpleSku">SKU</Label>
                <Input
                  id="simpleSku"
                  placeholder="PROD-001"
                  {...register("simpleSku")}
                  className={errors?.simpleSku ? "border-destructive" : ""}
                />
                {errors?.simpleSku && (
                  <p className="text-sm text-destructive">
                    {errors.simpleSku.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
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
            )}
          />
          {errors?.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Label htmlFor="isFeatured">Featured Product</Label>
              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isFeatured"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Mark this product as featured
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Label htmlFor="isLatest">Latest Product</Label>
              <Controller
                name="isLatest"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isLatest"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Mark this product as latest
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}