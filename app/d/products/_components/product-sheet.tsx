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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Plus, X, Settings, ShoppingCart, Eye } from "lucide-react";

// Form & Validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export type Product = {
  id: string;
  name: string;
  category: string;
  brand: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

interface ProductSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: Product | null;
  onSave: (product: Partial<Product>) => void;
  mode: "create" | "edit";
}

// ProductForm Component - UI Only
function ProductForm() {
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [productCombinations, setProductCombinations] = useState<any[]>([
    {
      id: 1,
      variants: {},
      sku: "",
      name: "",
      price: "",
      stock: "",
      active: true,
    },
    {
      id: 2,
      variants: {},
      sku: "",
      name: "",
      price: "",
      stock: "",
      active: true,
    },
    {
      id: 3,
      variants: {},
      sku: "",
      name: "",
      price: "",
      stock: "",
      active: true,
    },
  ]);
  const [productWeight, setProductWeight] = useState<string>("");

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

  return (
    <div className="space-y-8 py-4">
      {/* Basic Product Information */}
      <div className="space-y-4">
        <h3 className="tracking-tight font-medium text-muted-foreground">
          Info Produk
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Nama Produk *</Label>
            <Input id="productName" placeholder="iPhone 17 Pro Max" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Smartphones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smartphones">Smartphones</SelectItem>
                <SelectItem value="televisions">Televisions</SelectItem>
                <SelectItem value="smart-watches">Smart Watches</SelectItem>
                <SelectItem value="home-appliances">Home Appliances</SelectItem>
                <SelectItem value="computer-laptops">
                  Computer & Laptops
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Apple" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="samsung">Samsung</SelectItem>
                <SelectItem value="xiaomi">Xiaomi</SelectItem>
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
              onChange={(e) => setProductWeight(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi Produk</Label>
          <Textarea
            id="description"
            placeholder="Deskripsikan fitur dan spesifikasi produk..."
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="isActive">Status Aktif</Label>
            <p className="text-sm text-muted-foreground">
              Aktifkan grup ini untuk dijual
            </p>
          </div>
          <Switch id="isActive" defaultChecked />
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
                {["color", "screen", "storage", "type"].map((variantType) => (
                  <div
                    key={variantType}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      id={`variant-${variantType}`}
                      checked={selectedVariants.includes(variantType)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVariants((prev) => [...prev, variantType]);
                        } else {
                          setSelectedVariants((prev) =>
                            prev.filter((v) => v !== variantType)
                          );
                          // Clear variant values from all combinations when unchecked
                          setProductCombinations((prev) =>
                            prev.map((combination) => ({
                              ...combination,
                              variants: Object.fromEntries(
                                Object.entries(combination.variants).filter(
                                  ([key]) => key !== variantType
                                )
                              ),
                            }))
                          );
                        }
                      }}
                      className="rounded border-gray-300 size-4"
                    />
                    <Label
                      htmlFor={`variant-${variantType}`}
                      className="capitalize cursor-pointer"
                    >
                      {variantType}
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
                    <Button variant="secondary" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
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
                      updateCombination(combination.id, "sku", e.target.value)
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
                      updateCombination(combination.id, "price", e.target.value)
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
                      updateCombination(combination.id, "stock", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductSheet({
  isOpen,
  onClose,
  selectedProduct,
  onSave,
  mode,
}: ProductSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-h-[100vh] w-full ">
        <SheetHeader className="pb-4">
          <SheetTitle>Add New Product</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-scroll max-h-[calc(100vh-160px)]">
          <ProductForm />
        </div>

        <div className="flex-shrink-0 p-6 border-t bg-background">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button>Save Product</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
