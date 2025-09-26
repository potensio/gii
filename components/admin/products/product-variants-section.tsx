"use client";

import * as React from "react";
import { X, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PriceInput } from "@/components/ui/price-input";
import {
  VARIANT_ATTRIBUTE_TYPES,
  ProductVariant,
  VariantAttribute,
} from "./types";
import { VariantAttributeType } from "@/lib/generated/prisma/enums";
import { FieldErrors } from "react-hook-form";
import { CreateProductFormData } from "@/lib/schemas/product-form.schema";

interface ProductVariantsSectionProps {
  variants: ProductVariant[];
  selectedAttributes: VariantAttributeType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddVariant: () => void;
  onRemoveVariant: (id: string) => void;
  onAttributeSelect: (attributeType: VariantAttributeType) => void;
  onUpdateVariantAttribute: (
    variantId: string,
    attributeType: VariantAttributeType,
    value: string
  ) => void;
  onUpdateVariantField: (
    variantId: string,
    field: "price" | "stock",
    value: string
  ) => void;
  errors?: FieldErrors<CreateProductFormData>;
}

export function ProductVariantsSection({
  variants,
  selectedAttributes,
  onAddVariant,
  onRemoveVariant,
  onAttributeSelect,
  onUpdateVariantAttribute,
  onUpdateVariantField,
  errors,
}: ProductVariantsSectionProps) {
  const [open, setOpen] = React.useState(false);
  
  const selectedAttributesError = errors?.selectedAttributes;
  const variantsError = errors?.variants;
  const hasGeneralVariantsError = typeof variantsError === 'object' && 'message' in variantsError;

  return (
    <section className="space-y-4">
      <h2 className="font-semibold tracking-tight border-b pb-2">
        Product Variants
      </h2>

      {/* General error for selectedAttributes */}
      {selectedAttributesError && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {selectedAttributesError.message}
        </div>
      )}

      {/* General error for variants array */}
      {hasGeneralVariantsError && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {variantsError.message}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddVariant}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Variant
          </Button>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-[200px] justify-between",
                  selectedAttributesError ? "border-destructive" : ""
                )}
              >
                Variant Attributes
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search attributes..." />
                <CommandEmpty>No attribute found.</CommandEmpty>
                <CommandGroup>
                  {VARIANT_ATTRIBUTE_TYPES.map((attribute) => (
                    <CommandItem
                      key={attribute.value}
                      onSelect={() => onAttributeSelect(attribute.value)}
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
                <Badge key={attrType} variant="secondary" className="gap-1">
                  {attrLabel}
                  <button
                    onClick={() => onAttributeSelect(attrType)}
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
        {variants.map((variant, index) => {
          const variantError = Array.isArray(variantsError) ? variantsError[index] : null;
          const attributesError = variantError?.attributes;
          const priceError = variantError?.price;
          const stockError = variantError?.stock;

          return (
            <div key={variant.id} className={cn(
              "border rounded-lg p-3 space-y-0",
              variantError ? "border-destructive" : ""
            )}>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Variant #{index + 1}</h4>
                {variants.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveVariant(variant.id)}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {/* Variant-level error messages */}
              {attributesError && typeof attributesError === 'object' && 'message' in attributesError && (
                <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-md mb-2">
                  {attributesError.message}
                </div>
              )}
              
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${
                    selectedAttributes.length + 2
                  }, 1fr)`,
                }}
              >
                {variant.attributes.map((attribute, attrIndex) => {
                  const attrError = Array.isArray(attributesError) ? attributesError[attrIndex] : null;
                  const valueError = attrError?.value;

                  return (
                    <div key={attrIndex} className="space-y-1 min-w-0">
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
                          onUpdateVariantAttribute(
                            variant.id,
                            attribute.type,
                            e.target.value
                          )
                        }
                        className={cn(
                          "h-8",
                          valueError ? "border-destructive" : ""
                        )}
                      />
                      {valueError && (
                        <p className="text-xs text-destructive">
                          {valueError.message}
                        </p>
                      )}
                    </div>
                  );
                })}
                <div className="space-y-1 min-w-0">
                  <Label className="text-xs">Price</Label>
                  <PriceInput
                    placeholder="0"
                    value={variant.price}
                    onChange={(value) =>
                      onUpdateVariantField(variant.id, "price", value)
                    }
                    className={cn(
                      "h-8",
                      priceError ? "border-destructive" : ""
                    )}
                  />
                  {priceError && (
                    <p className="text-xs text-destructive">
                      {priceError.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1 min-w-0">
                  <Label className="text-xs">Stock</Label>
                  <Input
                    placeholder="0"
                    value={variant.stock}
                    onChange={(e) =>
                      onUpdateVariantField(variant.id, "stock", e.target.value)
                    }
                    className={cn(
                      "h-8",
                      stockError ? "border-destructive" : ""
                    )}
                  />
                  {stockError && (
                    <p className="text-xs text-destructive">
                      {stockError.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}