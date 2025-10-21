"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductTable, Product } from "./_components/product-table";
import { UserFilters } from "./_components/user-filters";
import { ProductSheet } from "./_components/product-sheet";
import {
  useUsers,
  useUpdateUser,
  useDeleteUser,
  useCreateUser,
} from "@/hooks/use-users";

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [filters, setFilters] = useState({
    page: 1,
    search: "",
    role: undefined as "user" | "admin" | "super_admin" | undefined,
    isActive: undefined as boolean | undefined,
  });

  // Separate state for UI filter controls
  const [uiFilters, setUiFilters] = useState({
    search: "",
    role: "all",
    isActive: "all",
  });

  // Update filters when UI filters change
  const updateFilters = (newUiFilters: typeof uiFilters) => {
    setUiFilters(newUiFilters);
    setFilters({
      page: 1, // Reset to first page when filtering
      search: newUiFilters.search,
      role:
        newUiFilters.role !== "all"
          ? (newUiFilters.role as "user" | "admin" | "super_admin")
          : undefined,
      isActive:
        newUiFilters.isActive !== "all"
          ? newUiFilters.isActive === "true"
          : undefined,
    });
  };

  // TanStack Query hooks
  const { data: usersData, isLoading, error } = useUsers(filters);
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const createUserMutation = useCreateUser();

  const productsData = [
    {
      id: "1",
      name: "Produk 1",
      brand: "Apple",
      category: "Elektronik",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Produk 2",
      brand: "Apple",
      category: "Elektronik",
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const handleRowClick = (product: Product) => {
    setSelectedUser(product);
    setSheetMode("edit");
    setIsSheetOpen(true);
  };

  // const handleEditProduct = (product: Product) => {
  //   setSelectedUser(product);
  //   setSheetMode("edit");
  //   setIsSheetOpen(true);
  // };

  // const handleDeleteProduct = (product: Product) => {
  //   deleteUserMutation.mutate(product.id);
  // };

  const handleAddUser = () => {
    setSelectedUser(null);
    setSheetMode("create");
    setIsSheetOpen(true);
  };

  const handleSaveUser = (userData: Partial<Product>) => {
    if (sheetMode === "edit" && selectedUser) {
      // Update existing user
      updateUserMutation.mutate({
        id: selectedUser.id,
        data: userData,
      });
    } else {
      // Create new user
      // createUserMutation.mutate({
      //   name: userData.name!,
      //   email: userData.email!,
      //   role: userData.role!,
      // });
    }

    // Close sheet and reset state
    setIsSheetOpen(false);
    setSelectedUser(null);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedUser(null);
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive-foreground">
            Error loading users: {error.message}
          </div>
        </div>
      </div>
    );
  }

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
      <UserFilters
        searchValue={uiFilters.search}
        onSearchChange={(value: string) =>
          updateFilters({ ...uiFilters, search: value })
        }
        roleFilter={uiFilters.role}
        onRoleFilterChange={(value: string) =>
          updateFilters({ ...uiFilters, role: value })
        }
        statusFilter={uiFilters.isActive}
        onStatusFilterChange={(value: string) =>
          updateFilters({ ...uiFilters, isActive: value })
        }
      />

      {/* Product Table */}
      <ProductTable
        products={productsData || []}
        onRowClick={handleRowClick}
        // onEditProduct={handleEditUser}
        // onDeleteProduct={handleDeleteUser}
        isLoading={isLoading}
      />

      {/* User Sheet */}
      <ProductSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        selectedUser={null}
        onSave={handleSaveUser}
        mode={sheetMode}
      />
    </div>
  );
}
