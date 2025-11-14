"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SelectAddress, InsertAddress } from "@/lib/db/schema";

interface AddressResponse {
  success: boolean;
  message: string;
  data?: SelectAddress | SelectAddress[];
}

const addressApi = {
  getAddresses: async (): Promise<AddressResponse> => {
    const response = await fetch("/api/addresses");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    return response.json();
  },

  createAddress: async (
    data: Omit<InsertAddress, "userId" | "id" | "createdAt" | "updatedAt">
  ): Promise<AddressResponse> => {
    const response = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    return response.json();
  },

  updateAddress: async (
    id: string,
    data: Partial<
      Omit<InsertAddress, "userId" | "id" | "createdAt" | "updatedAt">
    >
  ): Promise<AddressResponse> => {
    const response = await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    return response.json();
  },

  deleteAddress: async (id: string): Promise<AddressResponse> => {
    const response = await fetch(`/api/addresses/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    return response.json();
  },

  setDefaultAddress: async (id: string): Promise<AddressResponse> => {
    const response = await fetch(`/api/addresses/${id}/set-default`, {
      method: "POST",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    return response.json();
  },
};

export const useAddresses = () => {
  const queryClient = useQueryClient();

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: addressApi.getAddresses,
  });

  const createMutation = useMutation({
    mutationFn: addressApi.createAddress,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      addressApi.updateAddress(id, data),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: addressApi.deleteAddress,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: addressApi.setDefaultAddress,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    addresses: addressesQuery.data?.data as SelectAddress[] | undefined,
    isLoading: addressesQuery.isLoading,
    isError: addressesQuery.isError,
    createAddress: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateAddress: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteAddress: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    setDefaultAddress: setDefaultMutation.mutate,
    isSettingDefault: setDefaultMutation.isPending,
  };
};
