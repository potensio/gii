"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums";
import {
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  PaginationOptions,
} from "@/lib/schemas/user.schema";
import { apiClient } from "@/lib/api-client";

// Types for API responses
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  admins: number;
  users: number;
  moderators: number;
}

// API functions
const userApi = {
  getUsers: async (
    filters: UserFilters,
    pagination: PaginationOptions
  ): Promise<UsersResponse> => {
    const params = new URLSearchParams();

    if (filters.role) params.append("role", filters.role);
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);

    params.append("page", pagination.page.toString());
    params.append("limit", pagination.limit.toString());
    params.append("sortBy", pagination.sortBy);
    params.append("sortOrder", pagination.sortOrder);

    const response = await apiClient.get<UsersResponse>(`/api/users?${params}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/api/users/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  createUser: async (data: CreateUserInput): Promise<User> => {
    const response = await apiClient.post<User>("/api/users", data);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  updateUser: async (id: string, data: UpdateUserInput): Promise<User> => {
    const response = await apiClient.put<User>(`/api/users/${id}`, data);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  deleteUser: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/api/users/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  getUserStats: async (): Promise<UserStats> => {
    const response = await apiClient.get<UserStats>("/api/users/stats");
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },
};

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UserFilters, pagination: PaginationOptions) =>
    [...userKeys.lists(), filters, pagination] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, "stats"] as const,
};

// Hooks
export function useUsers(
  filters: UserFilters = {},
  pagination: PaginationOptions = {
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  }
) {
  return useQuery({
    queryKey: userKeys.list(filters, pagination),
    queryFn: () => userApi.getUsers(filters, pagination),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: userApi.getUserStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      userApi.updateUser(id, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(updatedUser.id),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}
