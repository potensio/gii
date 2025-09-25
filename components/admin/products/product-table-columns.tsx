"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define types locally to avoid import issues
type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT" | "DISCONTINUED" | "OUT_OF_STOCK";

export interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  status: ProductStatus;
  category?: {
    id: string;
    name: string;
  } | null;
  brand?: {
    id: string;
    name: string;
  } | null;
  variants?: Array<{
    id: string;
    sku: string;
    stock: number;
    isDefault: boolean;
  }>;
  images?: Array<{
    id: string;
    url: string;
    altText: string;
    isMain: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductActionsProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onViewDetails?: (product: Product) => void;
}

function ProductActions({
  product,
  onEdit,
  onDelete,
  onViewDetails,
}: ProductActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(product.id)}
        >
          Copy product ID
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            navigator.clipboard.writeText(
              product.variants?.[0]?.sku || product.slug
            )
          }
        >
          Copy SKU
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {onViewDetails && (
          <DropdownMenuItem onClick={() => onViewDetails(product)}>
            View product details
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(product)}>
            Edit product
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => onDelete(product.id)}
          >
            Delete product
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function createProductColumns(actions?: {
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onViewDetails?: (product: Product) => void;
}): ColumnDef<Product>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "images",
      header: "Image",
      cell: ({ row }) => {
        const images = row.getValue("images") as Product["images"];
        const primaryImage = images?.[0];
        return (
          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={primaryImage.altText || "Product image"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xs text-muted-foreground">No image</div>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 80,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown />
          </Button>
        );
      },
      size: 200,
    },
    {
      id: "sku",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            SKU
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        const defaultVariant =
          product.variants?.find((v) => v.isDefault) || product.variants?.[0];
        return (
          <div className="font-mono text-xs">
            {defaultVariant?.sku || product.slug}
          </div>
        );
      },
      size: 150,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as Product["category"];
        return (
          <div className="text-sm">
            {category ? category.name : "No category"}
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => {
        const brand = row.getValue("brand") as Product["brand"];
        return <div className="text-sm">{brand ? brand.name : "No brand"}</div>;
      },
      size: 120,
    },
    {
      id: "price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        const price = product.basePrice;
        return (
          <div className="font-medium">Rp{price.toLocaleString("id-ID")}</div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as ProductStatus;
        return (
          <div
            className={`capitalize inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              status === "ACTIVE"
                ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"
                : status === "INACTIVE"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400"
            }`}
          >
            {status.toLowerCase()}
          </div>
        );
      },
      size: 100,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <ProductActions
            product={product}
            onEdit={actions?.onEdit}
            onDelete={actions?.onDelete}
            onViewDetails={actions?.onViewDetails}
          />
        );
      },
      size: 80,
    },
  ];
}
