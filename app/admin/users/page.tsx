"use client";

import * as React from "react";
import { UserTable } from "@/components/admin/users/user-table";
import { UserStatsCards } from "@/components/admin/users/user-stats-cards";
import { createUserColumns } from "@/components/admin/users/user-table-columns";
import { useUsers } from "@/hooks/use-users";

// Define types locally to avoid import issues
type UserRole = "ADMIN" | "USER" | "MODERATOR";
type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export default function UsersPage() {
  const [filters, setFilters] = React.useState({
    role: undefined as UserRole | undefined,
    status: undefined as UserStatus | undefined,
    search: "",
  });

  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
  });

  const { data, isLoading, error } = useUsers(filters, pagination);

  const handleRoleFilter = (role: UserRole | "all") => {
    setFilters((prev) => ({
      ...prev,
      role: role === "all" ? undefined : role,
    }));
  };

  const handleStatusFilter = (status: UserStatus | "all") => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? undefined : status,
    }));
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({
      ...prev,
      search,
    }));
  };

  if (error) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h3 className="mt-4 text-lg font-semibold">Error loading users</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
      </div>

      <UserStatsCards />

      <UserTable
        data={data?.users || []}
        columns={createUserColumns()}
        isLoading={isLoading}
        onRoleFilter={handleRoleFilter}
        onStatusFilter={handleStatusFilter}
        onSearchChange={handleSearchChange}
        currentSearch={filters.search}
        currentRole={filters.role ? filters.role : "all"}
        currentStatus={filters.status ? filters.status : "all"}
      />
    </div>
  );
}
