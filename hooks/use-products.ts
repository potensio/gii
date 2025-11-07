import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productGroups, productVariants, products } from "@/lib/db/schema";
import { toast } from "sonner";

export interface CompleteProduct {
  productGroup: typeof productGroups.$inferSelect;
  variants: (typeof productVariants.$inferSelect)[];
  products: (typeof products.$inferSelect)[];
  // Map per productId of its selected variant key->value (e.g., color: "black")
  variantSelectionsByProductId?: Record<string, Record<string, string>>;
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
  getProducts: async (filters: ProductFilters): Promise<CompleteProduct[]> => {
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
      toast.error(error.message || "Failed to fetch products");
      throw new Error(error.message || "Failed to fetch products");
    }
    // Parse response JSON
    return response.json();
  },

  // Create complete product (product group + variants + products)
  // createProduct: async (data: ProductFormInput): Promise<CompleteProduct> => {
  //   const response = await fetch("/api/admin/products", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(data),
  //   });

  //   if (!response.ok) {
  //     const error = await response.json();
  //     throw new Error(error.message || "Failed to create product");
  //   }

  //   return response.json();
  // },

  // // Update complete product
  // updateProduct: async (
  //   data: EditProductFormInput
  // ): Promise<CompleteProduct> => {
  //   const response = await fetch(`/api/admin/products/${data.}`, {
  //     method: "PUT",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(data),
  //   });

  //   if (!response.ok) {
  //     const error = await response.json();
  //     throw new Error(error.message || "Failed to update product");
  //   }

  //   return response.json();
  // },

  // // Delete product group (cascades to variants and products)
  // deleteProduct: async (id: string): Promise<void> => {
  //   const response = await fetch(`/api/admin/products/${id}`, {
  //     method: "DELETE",
  //   });

  //   if (!response.ok) {
  //     const error = await response.json();
  //     throw new Error(error.message || "Failed to delete product");
  //   }
  // },
};

// Query hooks
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productApi.getProducts(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
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
        throw new Error("Failed to fetch product");
      }
      console.log(response.json());
      return response.json();
    },
    enabled: !!id,
  });
}

// Mutation hooks
// export function useCreateProduct() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: productApi.createProduct,
//     onSuccess: (data) => {
//       // Invalidate and refetch products list
//       queryClient.invalidateQueries({ queryKey: ["products"] });

//       toast.success("Produk berhasil dibuat!");
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || "Gagal membuat produk");
//     },
//   });
// }

// export function useUpdateProduct() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: productApi.updateProduct,
//     onSuccess: (data) => {
//       // Update the specific product in cache
//       queryClient.setQueryData(["products", data.productGroup.id], data);

//       // Invalidate products list to refresh
//       queryClient.invalidateQueries({ queryKey: ["products"] });

//       toast.success("Produk berhasil diperbarui!");
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || "Gagal memperbarui produk");
//     },
//   });
// }

// export function useDeleteProduct() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: productApi.deleteProduct,
//     onSuccess: (_, deletedId) => {
//       // Remove from cache
//       queryClient.removeQueries({ queryKey: ["products", deletedId] });

//       // Invalidate products list
//       queryClient.invalidateQueries({ queryKey: ["products"] });

//       toast.success("Produk berhasil dihapus!");
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || "Gagal menghapus produk");
//     },
//   });
// }

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
