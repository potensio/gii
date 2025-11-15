"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferSelectModel } from "drizzle-orm";
import { users } from "@/lib/db/schema";
import { toast } from "sonner";

export type User = InferSelectModel<typeof users>;

interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  } | null;
}

interface UserResponse {
  success: boolean;
  message: string;
  data: User | null;
}

export interface UserFilters {
  status?: string;
  role?: string | "";
  isActive?: boolean;
  search?: string;
  page: number;
  pageSize: number;
}

// API functions
const userApi = {
  // Get all users with filters
  getUsers: async (filters: UserFilters): Promise<UsersResponse> => {
    // Build query params from filters
    const params = new URLSearchParams();
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    // Send request to API
    const response = await fetch(`/api/admin/users?${params}`);

    // Check if response is ok
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal memuat users");
    }
    // Parse response JSON
    return response.json();
  },

  // Create user
  createUser: async (data: {
    name: string;
    email: string;
    role: "user" | "admin" | "super_admin";
  }): Promise<UserResponse> => {
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal membuat user");
    }

    return response.json();
  },

  // Update user
  updateUser: async ({
    id,
    data,
  }: {
    id: string;
    data: Partial<User>;
  }): Promise<UserResponse> => {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal mengupdate user");
    }

    return response.json();
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal menghapus user");
    }
  },
};

// Query hooks
export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => userApi.getUsers(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      onError: (error: Error) => {
        toast.error(error.message || "Gagal memuat users");
      },
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal memuat user");
      }
      return response.json();
    },
    enabled: !!id,
    meta: {
      onError: (error: Error) => {
        toast.error(error.message || "Gagal memuat user");
      },
    },
  });
}

// Mutation hooks
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: (data) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.success("User berhasil dibuat dan email notifikasi telah dikirim");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat user");
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateUser,
    onSuccess: (data) => {
      // Update the specific user in cache
      if (data.data) {
        queryClient.setQueryData(["users", data.data.id], data);
      }

      // Invalidate users list to refresh
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.success("User berhasil diupdate");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengupdate user");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["users", deletedId] });

      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.success("User berhasil dihapus");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus user");
    },
  });
}

// Utility hook for optimistic updates
export function useOptimisticUserUpdate() {
  const queryClient = useQueryClient();

  const updateUserOptimistically = (
    userId: string,
    updater: (old: User) => User
  ) => {
    queryClient.setQueryData(["users", userId], (old: User | undefined) => {
      if (!old) return old;
      return updater(old);
    });
  };

  return { updateUserOptimistically };
}
