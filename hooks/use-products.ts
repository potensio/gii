import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferSelectModel } from "drizzle-orm";
import { productGroups, productVariants, products } from "@/lib/db/schema";
import { toast } from "sonner";
import type { ProductSchema } from "@/lib/validations/product.validation";

export interface CompleteProduct {
  productGroup: InferSelectModel<typeof productGroups>;
  variants: InferSelectModel<typeof productVariants>[];
  products: InferSelectModel<typeof products>[];
  // Map per productId of its selected variant key->value (e.g., color: "black")
  variantSelectionsByProductId?: Record<string, Record<string, string>>;
}

interface ProductGroupResponse {
  success: boolean;
  message: string;
  data: CompleteProduct[] | null;
}

// Response type for single product operations
export interface ProductResponse {
  success: boolean;
  message: string;
  data: CompleteProduct | null;
}

export interface ProductFilters {
  category?: string;
  brand?: string | "";
  isActive?: boolean;
  search?: string;
  page: number;
  pageSize: number;
}

// API functions (these would call your actual API routes)
const productApi = {
  // Get all product groups with their related data
  getProducts: async (
    filters: ProductFilters
  ): Promise<ProductGroupResponse> => {
    // Build query params from filters
    const params = new URLSearchParams();
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    // Send request to API
    const response = await fetch(`/api/admin/products?${params}`);

    // Check if response is ok
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal memuat produk");
    }
    // Parse response JSON
    return response.json();
  },

  // Create complete product (product group + variants + products)
  createProduct: async (data: ProductSchema): Promise<ProductResponse> => {
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal membuat produk");
    }

    return response.json();
  },

  // Update complete product
  updateProduct: async ({
    id,
    data,
  }: {
    id: string;
    data: ProductSchema;
  }): Promise<ProductResponse> => {
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal memperbarui produk");
    }

    return response.json();
  },
};

// Query hooks
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productApi.getProducts(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      onError: (error: Error) => {
        toast.error(error.message || "Gagal memuat produk");
      },
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/products/${id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal memuat produk");
      }
      return response.json();
    },
    enabled: !!id,
    meta: {
      onError: (error: Error) => {
        toast.error(error.message || "Gagal memuat produk");
      },
    },
  });
}

// Mutation hooks
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: (data) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success("Produk berhasil dibuat!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat produk");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.updateProduct,
    onSuccess: (data) => {
      // Update the specific product in cache
      if (data.data) {
        queryClient.setQueryData(["products", data.data.productGroup.id], data);
      }

      // Invalidate products list to refresh
      queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success("Produk berhasil diperbarui!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui produk");
    },
  });
}

// Utility hook for optimistic updates
export function useOptimisticProductUpdate() {
  const queryClient = useQueryClient();

  const updateProductOptimistically = (
    productId: string,
    updater: (old: CompleteProduct) => CompleteProduct
  ) => {
    queryClient.setQueryData(
      ["products", productId],
      (old: CompleteProduct | undefined) => {
        if (!old) return old;
        return updater(old);
      }
    );
  };

  return { updateProductOptimistically };
}
