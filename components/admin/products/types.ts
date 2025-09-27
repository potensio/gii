import { VariantAttributeType } from "@/lib/generated/prisma/enums";
// Import Product type from product-table-columns
import { Product } from "./product-table-columns";

// Define the predefined variant attribute types
export const VARIANT_ATTRIBUTE_TYPES = [
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
] as const;

export interface VariantAttribute {
  type: VariantAttributeType;
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  attributes: VariantAttribute[];
  price: string;
  stock: string;
  sku?: string;
}

export interface ProductImage {
  id: string;
  file?: File; // Optional untuk gambar yang sudah ada
  preview: string;
  isThumbnail: boolean;
  isExisting?: boolean; // Flag untuk membedakan gambar baru vs yang sudah ada
  existingImageData?: {
    url: string;
    publicId: string;
  }; // Data untuk gambar yang sudah ada
}

export interface SubDescription {
  id: string;
  title: string;
  content: string;
}

export interface ProductSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  productToEdit?: Product;
}
