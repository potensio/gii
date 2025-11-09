"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductTable } from "./_components/product-table";
import { ProductFilters } from "./_components/product-filters";
import { ProductSheet } from "./_components/product-sheet";
import { CompleteProduct } from "@/hooks/use-products";
import { useProducts } from "@/hooks/use-products";

export default function UsersPage() {
  const [selectedProduct, setSelectedProduct] =
    useState<CompleteProduct | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [filters, setFilters] = useState({
    page: 1,
    search: "",
    isActive: undefined as boolean | undefined,
    category: "",
    brand: "",
    pageSize: 10,
  });

  // TanStack Query hooks
  const { data: productsData, isLoading, error } = useProducts(filters);

  const handleRowClick = (data: CompleteProduct) => {
    setSelectedProduct(data);
    setSheetMode("edit");
    setIsSheetOpen(true);
  };

  // const handleEditProduct = (product: Product) => {
  //   setSelectedProduct(product);
  //   setSheetMode("edit");
  //   setIsSheetOpen(true);
  // };

  // const handleDeleteProduct = (product: Product) => {
  //   deleteUserMutation.mutate(product.id);
  // };

  const handleAddUser = () => {
    setSelectedProduct(null);
    setSheetMode("create");
    setIsSheetOpen(true);
  };

  // const handleSaveUser = (userData: Partial<CompleteProduct>) => {
  //   if (sheetMode === "edit" && selectedProduct) {
  //     // Update existing user
  //     updateUserMutation.mutate({
  //       id: selectedProduct.productGroup.id,
  //       data: userData,
  //     });
  //   } else {
  //     // Create new user
  //     // createUserMutation.mutate({
  //     //   name: userData.name!,
  //     //   email: userData.email!,
  //     //   role: userData.role!,
  //     // });
  //   }

  //   // Close sheet and reset state
  //   setIsSheetOpen(false);
  //   setSelectedProduct(null);
  // };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">Produk</h1>
        <Button size={"sm"} onClick={handleAddUser}>
          Tambahkan Produk
        </Button>
      </div>

      {/* User Filters */}
      <ProductFilters
        searchValue={filters.search}
        onSearchChange={(value: string) =>
          setFilters({ ...filters, search: value })
        }
        brandFilter={filters.brand || "all"}
        onBrandFilterChange={(value: string) =>
          setFilters({ ...filters, brand: value === "all" ? "" : value })
        }
        categoryFilter={filters.category || "all"}
        onCategoryFilterChange={(value: string) =>
          setFilters({ ...filters, category: value === "all" ? "" : value })
        }
        statusFilter={
          filters.isActive === undefined
            ? "all"
            : filters.isActive
              ? "active"
              : "inactive"
        }
        onStatusFilterChange={(value) =>
          setFilters({
            ...filters,
            isActive:
              value === "all" ? undefined : value === "active" ? true : false,
          })
        }
      />

      {/* Product Table */}

      <ProductTable
        products={productsData?.data || []}
        onRowClick={handleRowClick}
        // onEditProduct={handleEditUser}
        // onDeleteProduct={handleDeleteUser}
        isLoading={isLoading}
      />

      {/* User Sheet */}
      <ProductSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        selectedProduct={selectedProduct}
        mode={sheetMode}
      />
    </div>
  );
}
