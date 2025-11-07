import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Plus, X, Eye } from "lucide-react";

// Form & Validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productSchema,
  variantSchema,
  variantCombinationSchema,
} from "@/lib/validations/product.validation";
import type { ProductSchema } from "@/lib/validations/product.validation";
import { CompleteProduct } from "@/hooks/use-products";

// Import enums
import { VARIANT_TYPES, PRODUCT_CATEGORIES, PRODUCT_BRANDS } from "@/lib/enums";
import type { ProductCategory, ProductBrand, VariantType } from "@/lib/enums";

interface ProductSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: CompleteProduct | null;
  mode: "create" | "edit";
}

// ProductForm Component - UI Only
function ProductForm({
  onClose,
  selectedProduct,
  mode,
}: {
  onClose: () => void;
  selectedProduct: CompleteProduct | null;
  mode: "create" | "edit";
}) {
  const [selectedVariants, setSelectedVariants] = useState<VariantType[]>([]);
  const [productCombinations, setProductCombinations] = useState<any[]>([
    {
      id: 1,
      variants: {},
      sku: "",
      name: "",
      price: "0",
      stock: "0",
      active: true,
    },
  ]);
  const [productWeight, setProductWeight] = useState<string>("");

  const toCombinationPayload = (c: any) => ({
    id: typeof c.id === "string" ? c.id : String(c.id),
    variants: c.variants ?? {},
    sku: c.sku ?? "",
    name: c.name || undefined,
    price: typeof c.price === "number" ? c.price : Number(c.price) || 0,
    stock: typeof c.stock === "number" ? c.stock : Number(c.stock) || 0,
    active: Boolean(c.active),
  });

  const addProductCombination = () => {
    const newId = Math.max(...productCombinations.map((p) => p.id), 0) + 1;
    const newCombination = {
      id: newId,
      variants: {},
      sku: "",
      name: "",
      price: "",
      stock: "",
      active: true,
    };
    setProductCombinations((prev) => [...prev, newCombination]);
  };

  const removeProductCombination = (id: number) => {
    setProductCombinations((prev) => prev.filter((p) => p.id !== id));
  };

  const updateCombination = (id: number, field: string, value: any) => {
    setProductCombinations((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // react-hook-form instance aligned with productSchema
  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "smartphones" as ProductCategory,
      brand: "apple" as ProductBrand,
      // category & brand akan dipilih via Select; biarkan tidak di-set pada default
      isActive: true, // sesuai Switch defaultChecked
      hasVariants: true, // sesuai Switch defaultChecked
      // berat opsional; biarkan undefined sampai user isi
      weight: undefined,
      description: undefined,
      variantTypes: [],
      combinations: productCombinations.map(toCombinationPayload),
    },
  });

  useEffect(() => {
    form.setValue(
      "combinations",
      productCombinations.map(toCombinationPayload)
    );
  }, [productCombinations]);

  const onSubmit = (data: ProductSchema) => {
    console.log("Product payload", data);
  };

  // Prefill defaults when editing an existing product
  useEffect(() => {
    if (mode === "edit" && selectedProduct) {
      const allowedVariantValues = Object.values(VARIANT_TYPES).map(
        (v) => v.value
      ) as VariantType[];
      const initialVariantTypes = Array.from(
        new Set(selectedProduct.variants.map((v) => v.variant))
      ).filter((v): v is VariantType =>
        (allowedVariantValues as readonly string[]).includes(v)
      ) as VariantType[];

      const initialCombinations = (selectedProduct.products ?? []).map((p) => ({
        id: p.id,
        variants:
          (selectedProduct.variantSelectionsByProductId &&
            selectedProduct.variantSelectionsByProductId[p.id]) || {},
        sku: p.sku ?? "",
        name: p.name ?? "",
        price: String(p.price ?? 0),
        stock: String(p.stock ?? 0),
        active: !!p.isActive,
      }));

      setSelectedVariants(initialVariantTypes);
      setProductCombinations(initialCombinations);
      setProductWeight(
        selectedProduct.productGroup?.weight != null
          ? String(selectedProduct.productGroup.weight)
          : ""
      );

      form.reset({
        id: selectedProduct.productGroup.id,
        name: selectedProduct.productGroup.name ?? "",
        category: selectedProduct.productGroup.category as ProductCategory,
        brand: selectedProduct.productGroup.brand as ProductBrand,
        isActive: !!selectedProduct.productGroup.isActive,
        hasVariants: initialVariantTypes.length > 0,
        weight: selectedProduct.productGroup?.weight ?? undefined,
        description: selectedProduct.productGroup.description ?? undefined,
        variantTypes: initialVariantTypes,
        combinations: initialCombinations.map(toCombinationPayload),
      });
    }
  }, [mode, selectedProduct]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex-1 p-6 overflow-y-scroll max-h-[calc(100vh-160px)]">
        <div className="space-y-8">
          {/* Basic Product Information */}
          <div className="space-y-4">
            <h3 className="tracking-tight font-medium text-muted-foreground">
              Info Produk
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Produk *</Label>
                <Input
                  id="name"
                  placeholder="iPhone 17 Pro Max"
                  {...form.register("name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select
                  value={form.watch("category")}
                  onValueChange={(v) =>
                    form.setValue("category", v as ProductCategory, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Smartphones" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PRODUCT_CATEGORIES).map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Select
                  value={form.watch("brand")}
                  onValueChange={(v) =>
                    form.setValue("brand", v as ProductBrand, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Apple" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PRODUCT_BRANDS).map((brand) => (
                      <SelectItem key={brand.value} value={brand.value}>
                        {brand.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight"> Berat Produk (grams)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Masukkan berat produk dalam gram"
                  value={productWeight}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProductWeight(val);
                    form.setValue(
                      "weight",
                      val === "" ? undefined : Number(val),
                      {
                        shouldValidate: true,
                      }
                    );
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Produk</Label>
              <Textarea
                id="description"
                placeholder="Deskripsikan fitur dan spesifikasi produk..."
                rows={3}
                {...form.register("description")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Status Aktif</Label>
                <p className="text-sm text-muted-foreground">
                  Aktifkan grup ini untuk dijual
                </p>
              </div>
              <Switch
                id="isActive"
                checked={!!form.watch("isActive")}
                onCheckedChange={(checked) =>
                  form.setValue("isActive", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hasVariants">Aktifkan Variasi</Label>
                <p className="text-sm text-muted-foreground">
                  Aktifkan variasi produk ini
                </p>
              </div>
              <Switch
                id="hasVariants"
                checked={!!form.watch("hasVariants")}
                onCheckedChange={(checked) =>
                  form.setValue("hasVariants", checked)
                }
              />
            </div>
          </div>

          <Separator />

          {/* Product Variants */}
          <div className="space-y-6 flex justify-between items-start">
            <div className="flex flex-col space-y-4">
              <h3 className="tracking-tight font-medium text-muted-foreground">
                Varian Produk
              </h3>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-4">
                    {Object.values(VARIANT_TYPES).map((variantType) => (
                      <div
                        key={variantType.value}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`variant-${variantType.value}`}
                          checked={selectedVariants.includes(variantType.value)}
                          onChange={(e) => {
                            const key = variantType.value as VariantType;
                            if (e.target.checked) {
                              const next: VariantType[] = [
                                ...selectedVariants,
                                key,
                              ];
                              setSelectedVariants(next);
                              form.setValue("variantTypes", next, {
                                shouldValidate: true,
                              });
                            } else {
                              const next: VariantType[] =
                                selectedVariants.filter((v) => v !== key);
                              setSelectedVariants(next);
                              form.setValue("variantTypes", next, {
                                shouldValidate: true,
                              });
                              // Clear variant values from all combinations when unchecked
                              setProductCombinations((prev) =>
                                prev.map((combination) => ({
                                  ...combination,
                                  variants: Object.fromEntries(
                                    Object.entries(combination.variants).filter(
                                      ([k]) => k !== key
                                    )
                                  ),
                                }))
                              );
                            }
                          }}
                          className="rounded border-gray-300 size-4"
                        />
                        <Label
                          htmlFor={`variant-${variantType.value}`}
                          className="capitalize cursor-pointer"
                        >
                          {variantType.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pilih variant yang akan digunakan
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={addProductCombination} size="sm">
              <Plus className="w-5 h-5" />
              Tambah Varian
            </Button>
          </div>

          {/* Product Combinations */}
          <div>
            {/* Add Product Button */}
            <div className="flex justify-center"></div>

            {/* Product combination items */}
            <div className="space-y-4">
              {productCombinations.map((combination, index) => (
                <div
                  key={combination.id}
                  className="p-4 bg-card border rounded-lg shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      Varian #{index + 1}
                    </p>
                    <div className="flex space-x-3">
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm font-normal text-muted-foreground">
                          Visible
                        </Label>
                        <Switch
                          checked={!!combination.active}
                          onCheckedChange={(checked) =>
                            updateCombination(combination.id, "active", checked)
                          }
                        />
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => removeProductCombination(combination.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>{" "}
                  </div>

                  {/* Dynamic variant fields */}

                  <div className="flex gap-4">
                    {selectedVariants.map((variantType) => (
                      <div key={variantType} className="space-y-2 w-full">
                        <Label className="text-sm font-medium capitalize">
                          {variantType}
                        </Label>
                        <Input
                          placeholder={`Enter ${variantType}`}
                          className="text-sm"
                          value={combination.variants[variantType] || ""}
                          onChange={(e) => {
                            const newVariants = {
                              ...combination.variants,
                              [variantType]: e.target.value,
                            };
                            updateCombination(
                              combination.id,
                              "variants",
                              newVariants
                            );
                          }}
                        />
                      </div>
                    ))}
                    <div className="space-y-2 w-full">
                      <Label className="text-sm font-medium">SKU</Label>
                      <Input
                        placeholder="Nomor sku"
                        className="text-sm"
                        value={combination.sku}
                        onChange={(e) =>
                          updateCombination(
                            combination.id,
                            "sku",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2 w-full">
                      <Label className="text-sm font-medium">Price (IDR)</Label>
                      <Input
                        placeholder="15,000,000"
                        type="number"
                        className="text-sm"
                        value={combination.price}
                        onChange={(e) =>
                          updateCombination(
                            combination.id,
                            "price",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2 w-full">
                      <Label className="text-sm font-medium">Stock</Label>
                      <Input
                        placeholder="0"
                        type="number"
                        className="text-sm"
                        value={combination.stock}
                        onChange={(e) =>
                          updateCombination(
                            combination.id,
                            "stock",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 p-6 border-t bg-background">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Product</Button>
        </div>
      </div>
    </form>
  );
}

export function ProductSheet({
  isOpen,
  onClose,
  selectedProduct,
  mode,
}: ProductSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-h-[100vh] w-full p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle>Add New Product</SheetTitle>
        </SheetHeader>

        <ProductForm
          onClose={onClose}
          selectedProduct={selectedProduct}
          mode={mode}
        />
      </SheetContent>
    </Sheet>
  );
}
