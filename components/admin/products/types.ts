import { VariantAttributeType } from "@/lib/generated/prisma/enums";

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
}

export interface ProductImage {
  id: string;
  file: File;
  preview: string;
  isThumbnail: boolean;
}

export interface SubDescription {
  id: string;
  title: string;
  content: string;
}

export interface CreateProductSheetProps {
  isOpen: boolean;
  onClose: () => void;
}