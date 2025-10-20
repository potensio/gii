"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserTable, User } from "./_components/user-table";
import { UserFilters } from "./_components/user-filters";
import { UserSheet } from "./_components/user-sheet";
import { useUsers, useUpdateUser, useDeleteUser } from "@/hooks/use-users";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
      role: newUiFilters.role !== "all" ? (newUiFilters.role as "user" | "admin" | "super_admin") : undefined,
      isActive: newUiFilters.isActive !== "all" ? newUiFilters.isActive === "true" : undefined,
    });
  };

  // TanStack Query hooks
  const { data: usersData, isLoading, error } = useUsers(filters);
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setSheetMode("edit");
    setIsSheetOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setSheetMode("edit");
    setIsSheetOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    deleteUserMutation.mutate(user.id);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setSheetMode("create");
    setIsSheetOpen(true);
  };

  const handleSaveUser = (userData: Partial<User>) => {
    if (sheetMode === "edit" && selectedUser) {
      // Update existing user
      updateUserMutation.mutate({
        id: selectedUser.id,
        data: userData,
      });
    } else {
      // Create new user - this would need a separate API endpoint
      console.log("Create new user:", userData);
      // TODO: Implement create user API
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">User</h1>
        <Button size={"sm"} onClick={handleAddUser}>
          Tambahkan User
        </Button>
      </div>

      <UserFilters
        searchValue={uiFilters.search}
        onSearchChange={(value: string) => updateFilters({ ...uiFilters, search: value })}
        roleFilter={uiFilters.role}
        onRoleFilterChange={(value: string) => updateFilters({ ...uiFilters, role: value })}
        statusFilter={uiFilters.isActive}
        onStatusFilterChange={(value: string) => updateFilters({ ...uiFilters, isActive: value })}
      />
      <UserTable
        users={usersData?.users || []}
        onRowClick={handleRowClick}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        isLoading={isLoading}
      />

      <UserSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        selectedUser={selectedUser}
        onSave={handleSaveUser}
        mode={sheetMode}
      />
    </div>
  );
}
