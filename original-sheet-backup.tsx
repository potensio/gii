"use client";

import * as React from "react";
import { useState } from "react";
import { X, Plus, Upload, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define the predefined variant attribute types
const VARIANT_ATTRIBUTE_TYPES = [
  { value: "COLOR", label: "Color" },
  { value: "SIZE", label: "Size" },
  { value: "STORAGE", label: "Storage" },
  { value: "MEMORY", label: "Memory" },
  { value: "PROCESSOR", label: "Processor" },
  { value: "MATERIAL", label: "Material" },
  { value: "CAPACITY", label: "Capacity" },
  { value: "MODEL", label: "Model" },
  { value: "DIMENSION", label: "Dimension" },
  { value: "FEATURE", label: "Feature" },
];

// Define the VariantAttributeType enum locally since Prisma is removed
type VariantAttributeType = 
  | "COLOR"
  | "SIZE" 
  | "STORAGE"
  | "MEMORY"
  | "PROCESSOR"
  | "MATERIAL"
  | "CAPACITY"
  | "MODEL"
  | "DIMENSION"
  | "FEATURE";

interface VariantAttribute {
  type: VariantAttributeType;
  name: string;
  value: string;
}

interface ProductVariant {
  id: string;
  attributes: VariantAttribute[];
  price: string;
  stock: string;
}

interface CreateProductSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProductSheet({
  isOpen,
  onClose,
}: CreateProductSheetProps) {
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  // SEO & Metatag states
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");

  // Selected variant attributes
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([
    "COLOR",
    "STORAGE",
  ]);
  const [open, setOpen] = useState(false);

  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: "1",
      attributes: [
        { type: "COLOR", name: "Color", value: "Black" },
        { type: "STORAGE", name: "Storage", value: "128GB" },
      ],
      price: "999.00",
      stock: "100",
    },
    {
      id: "2",
      attributes: [
        { type: "COLOR", name: "Color", value: "White" },
        { type: "STORAGE", name: "Storage", value: "256GB" },
      ],
      price: "1099.00",
      stock: "50",
    },
  ]);

  // Update variants when selected attributes change
  React.useEffect(() => {
    setVariants((prevVariants) =>
      prevVariants.map((variant) => ({
        ...variant,
        attributes: selectedAttributes.map((attrType) => {
          const existingAttr = variant.attributes.find(
            (attr) => attr.type === attrType
          );
          const attrLabel =
            VARIANT_ATTRIBUTE_TYPES.find((type) => type.value === attrType)
              ?.label || attrType;

          return (
            existingAttr || {
              type: attrType as VariantAttributeType,
              name: attrLabel,
              value: "",
            }
          );
        }),
      }))
    );
  }, [selectedAttributes]);

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      attributes: selectedAttributes.map((attrType) => {
        const attrLabel =
          VARIANT_ATTRIBUTE_TYPES.find((type) => type.value === attrType)
            ?.label || attrType;

        return {
          type: attrType as VariantAttributeType,
          name: attrLabel,
          value: "",
        };
      }),
      price: "",
      stock: "",
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((variant) => variant.id !== id));
  };

  const updateVariantAttribute = (
    variantId: string,
    attributeType: string,
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              attributes: variant.attributes.map((attr) =>
                attr.type === attributeType ? { ...attr, value } : attr
              ),
            }
          : variant
      )
    );
  };

  const updateVariantField = (
    variantId: string,
    field: "price" | "stock",
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === variantId ? { ...variant, [field]: value } : variant
      )
    );
  };

  const handleAttributeSelect = (attributeValue: string) => {
    setSelectedAttributes((prev) =>
      prev.includes(attributeValue)
        ? prev.filter((item) => item !== attributeValue)
        : [...prev, attributeValue]
    );
  };

  const handleSave = () => {
    // TODO: Implement save logic
    console.log("Saving product...", {
      productName,
      brand,
      description,
      basePrice,
      category,
      sku,
      status,
      metaTitle,
      metaDescription,
      keywords,
      selectedAttributes,
      variants,
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="h-[100vh] flex flex-col gap-0 w-full max-w-none border-none p-0"
      >
        <SheetHeader className="absolute top-0 left-0 right-0 bg-background border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-left text-xl font-semibold">
                Create Product
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                Add new products and manage variants
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="flex max-h-full pt-20">
          <div className="flex w-full justify-center max-h-full overflow-y-auto">
            {/* Main Content */}
            <div className="flex flex-col w-full max-w-4xl p-3 md:p-8 space-y-14">
              {/* Product Information */}
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
                        onChange={(e) => setProductName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="category">Kategori</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">
                            Electronics
                          </SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="brand">Merk</Label>
                      <Input
                        id="brand"
                        placeholder="Apple"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        placeholder="Nomor SKU"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="description">Deskripsi Produk</Label>
                    <Textarea
                      id="description"
                      placeholder="iPhone 14 Pro Max 256GB – Deep Purple. Super Retina XDR, kamera Pro 48MP, dan chip A16 Bionic."
                      className="min-h-[80px]"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="basePrice">Harga Dasar</Label>
                      <Input
                        id="basePrice"
                        placeholder="0.00"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="status">Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Product Images */}
              <section className="space-y-4">
                <h2 className="font-semibold tracking-tight border-b pb-2">
                  Galeri Produk
                </h2>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="size-5 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop images or click to browse
                  </p>
                  <Button variant="outline" size="sm">
                    Browse Files
                  </Button>
                </div>
              </section>

              {/* Product Variants */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="font-semibold tracking-tight">Varian</h2>
                  <div className="flex gap-2">
                    <Button onClick={addVariant} size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Variant
                    </Button>
                  </div>
                </div>

                {/* Variant Attributes Selection */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="space-y-2">
                    <Label>Variant Attributes</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between font-normal"
                        >
                          {selectedAttributes.length === 0
                            ? "Select attributes..."
                            : `${selectedAttributes.length} attribute${
                                selectedAttributes.length > 1 ? "s" : ""
                              } selected`}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search attributes..." />
                          <CommandEmpty>No attributes found.</CommandEmpty>
                          <CommandGroup>
                            {VARIANT_ATTRIBUTE_TYPES.map((attribute) => (
                              <CommandItem
                                key={attribute.value}
                                onSelect={() =>
                                  handleAttributeSelect(attribute.value)
                                }
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedAttributes.includes(attribute.value)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {attribute.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Show selected attributes as badges */}
                  {selectedAttributes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedAttributes.map((attrType) => {
                        const attrLabel = VARIANT_ATTRIBUTE_TYPES.find(
                          (type) => type.value === attrType
                        )?.label;
                        return (
                          <Badge
                            key={attrType}
                            variant="secondary"
                            className="gap-1"
                          >
                            {attrLabel}
                            <button
                              onClick={() => handleAttributeSelect(attrType)}
                              className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <div
                      key={variant.id}
                      className="border rounded-lg p-3 space-y-0"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">
                          Variant #{index + 1}
                        </h4>
                        {variants.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(variant.id)}
                            className="text-destructive hover:text-destructive h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div
                        className="grid gap-3"
                        style={{
                          gridTemplateColumns: `repeat(${
                            selectedAttributes.length + 2
                          }, 1fr)`,
                        }}
                      >
                        {variant.attributes.map((attribute, attrIndex) => (
                          <div key={attrIndex} className="space-y-1">
                            <Label className="text-xs">{attribute.name}</Label>
                            <Input
                              placeholder={`e.g., ${
                                attribute.type === "COLOR"
                                  ? "Black"
                                  : attribute.type === "STORAGE"
                                  ? "128GB"
                                  : "Value"
                              }`}
                              value={attribute.value}
                              onChange={(e) =>
                                updateVariantAttribute(
                                  variant.id,
                                  attribute.type,
                                  e.target.value
                                )
                              }
                              className="h-8"
                            />
                          </div>
                        ))}
                        <div className="space-y-1">
                          <Label className="text-xs">Price</Label>
                          <Input
                            placeholder="0.00"
                            value={variant.price}
                            onChange={(e) =>
                              updateVariantField(
                                variant.id,
                                "price",
                                e.target.value
                              )
                            }
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Stock</Label>
                          <Input
                            placeholder="0"
                            value={variant.stock}
                            onChange={(e) =>
                              updateVariantField(
                                variant.id,
                                "stock",
                                e.target.value
                              )
                            }
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SEO & Metatag Section */}
              <section className="space-y-4">
                <h2 className="font-semibold tracking-tight border-b pb-2">
                  SEO & Metatag
                </h2>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      placeholder="iPhone 14 Pro Max - Premium Smartphone | Your Store"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      placeholder="Discover the iPhone 14 Pro Max with advanced camera system, A16 Bionic chip, and stunning display. Available in multiple colors and storage options."
                      className="min-h-[80px]"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      placeholder="iPhone, smartphone, Apple, mobile phone, premium phone"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section className="border border-transparent"></section>
            </div>
          </div>
          {/* Sidebar */}
          <div className="hidden w-full max-w-[400px] lg:flex flex-col justify-between bg-muted p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-3 text-sm">Preview</h3>
              <Card>
                <CardContent className="p-3">
                  <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium truncate text-sm">
                    {productName || "Product Name"}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {brand || "Brand"}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold text-sm">
                      Rp{basePrice || "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Button onClick={handleSave} className="w-full h-9">
                Create Product
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full h-9"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
