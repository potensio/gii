"use client";

import * as React from "react";
import { Columns3, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

import { User } from "./user-table-columns";

// Define types locally to avoid import issues
type UserRole = "ADMIN" | "USER" | "MODERATOR";
type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

interface UserTableFiltersProps {
  table: Table<User>;
  onRoleFilter?: (role: UserRole | "all") => void;
  onStatusFilter?: (status: UserStatus | "all") => void;
  onSearchChange?: (search: string) => void;
  // Add props to sync with parent state
  currentSearch?: string;
  currentRole?: UserRole | "all";
  currentStatus?: UserStatus | "all";
}

export function UserTableFilters({
  table,
  onRoleFilter,
  onStatusFilter,
  onSearchChange,
  currentSearch = "",
  currentRole = "all",
  currentStatus = "all",
}: UserTableFiltersProps) {
  const [searchInput, setSearchInput] = React.useState(currentSearch);
  const [roleFilter, setRoleFilter] = React.useState<UserRole | "all">(
    currentRole
  );
  const [statusFilter, setStatusFilter] = React.useState<UserStatus | "all">(
    currentStatus
  );

  // Sync local state with parent state when props change
  React.useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  React.useEffect(() => {
    setRoleFilter(currentRole);
  }, [currentRole]);

  React.useEffect(() => {
    setStatusFilter(currentStatus);
  }, [currentStatus]);

  const handleSearchSubmit = () => {
    onSearchChange?.(searchInput);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleRoleChange = (value: UserRole | "all") => {
    setRoleFilter(value);
    onRoleFilter?.(value);
  };

  const handleStatusChange = (value: UserStatus | "all") => {
    setStatusFilter(value);
    onStatusFilter?.(value);
  };

  const handleReset = () => {
    setSearchInput("");
    setRoleFilter("all");
    setStatusFilter("all");
    onSearchChange?.("");
    onRoleFilter?.("all");
    onStatusFilter?.("all");
  };

  const hasActiveFilters =
    searchInput !== "" || roleFilter !== "all" || statusFilter !== "all";

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Cari users..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyPress={handleKeyPress}
          className="max-w-[140px] h-10 text-sm focus:max-w-[200px] transition-all"
        />
        <Button
          onClick={handleSearchSubmit}
          size="sm"
          variant="outline"
          className="h-10 px-3"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Select value={roleFilter} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[140px] text-sm">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="USER">User</SelectItem>
          <SelectItem value="MODERATOR">Moderator</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[140px] text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="INACTIVE">Inactive</SelectItem>
          <SelectItem value="SUSPENDED">Suspended</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          onClick={handleReset}
          size="sm"
          variant="outline"
          className="h-10 px-3 text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={"icon"} className="ml-auto text-sm">
            <Columns3 />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
