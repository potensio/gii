import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "user" | "admin" | "super_admin";
  isActive: boolean;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GetUsersResponse {
  users: User[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface GetUsersParams {
  page?: number;
  search?: string;
  role?: "user" | "admin" | "super_admin";
  isActive?: boolean;
}

// Get auth token from localStorage or wherever you store it
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// API functions
const fetchUsers = async (
  params: GetUsersParams = {}
): Promise<GetUsersResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.role) searchParams.append("role", params.role);
  if (params.isActive !== undefined)
    searchParams.append("isActive", params.isActive.toString());

  const response = await fetch(`/api/admin/users?${searchParams.toString()}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch users");
  }

  const result = await response.json();
  return result.data;
};

const updateUser = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<User>;
}): Promise<User> => {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update user");
  }

  const result = await response.json();
  return result.data;
};

const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete user");
  }
};

// Hooks
export const useUsers = (params: GetUsersParams = {}) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => fetchUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      // Invalidate and refetch users queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil diupdate");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengupdate user");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Invalidate and refetch users queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil dihapus");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus user");
    },
  });
};
