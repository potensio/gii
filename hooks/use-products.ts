"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductStatus } from "@/lib/generated/prisma/enums";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateBrandInput,
  UpdateBrandInput,
} from "@/lib/schemas/product.schema";
import { PaginationOptions } from "@/lib/schemas/user.schema";
import { apiClient } from "@/lib/api-client";

// Types for API responses
interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  brandId: string;
  categoryId: string;
  basePrice: number;
  status: ProductStatus;
  featured: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  fabricFit?: string | null;
  careInstructions?: string | null;
  createdAt: Date;
  updatedAt: Date;
  brand?: Brand;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  specifications?: ProductSpecification[];
}

interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductImage {
  id: string;
  productId?: string | null;
  variantId?: string | null;
  url: string;
  altText: string;
  sortOrder: number;
  isMain: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductSpecification {
  id: string;
  productId: string;
  name: string;
  value: string;
  iconUrl?: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  discontinued: number;
  outOfStock: number;
  featured: number;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
  }>;
  byBrand: Array<{ brandId: string; brandName: string; count: number }>;
}

// API functions
const productApi = {
  getProducts: async (
    filters: ProductFilters,
    pagination: PaginationOptions
  ): Promise<ProductsResponse> => {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.brandId) params.append("brandId", filters.brandId);
    if (filters.search) params.append("search", filters.search);
    if (filters.minPrice)
      params.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice)
      params.append("maxPrice", filters.maxPrice.toString());
    if (filters.featured !== undefined)
      params.append("featured", filters.featured.toString());

    params.append("page", pagination.page.toString());
    params.append("limit", pagination.limit.toString());
    params.append("sortBy", pagination.sortBy);
    params.append("sortOrder", pagination.sortOrder);

    const response = await apiClient.get<ProductsResponse>(`/api/products?${params}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/api/products/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  createProduct: async (data: CreateProductInput): Promise<Product> => {
    const response = await apiClient.post<Product>("/api/products", data);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  updateProduct: async (
    id: string,
    data: UpdateProductInput
  ): Promise<Product> => {
    const response = await apiClient.put<Product>(`/api/products/${id}`, data);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  deleteProduct: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/api/products/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  getProductStats: async (): Promise<ProductStats> => {
    const response = await apiClient.get<ProductStats>("/api/products/stats");
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>("/api/categories");
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/api/categories/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  createCategory: async (data: CreateCategoryInput): Promise<Category> => {
    const response = await apiClient.post<Category>("/api/categories", data);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  updateCategory: async (
    id: string,
    data: UpdateCategoryInput
  ): Promise<Category> => {
    const response = await apiClient.put<Category>(`/api/categories/${id}`, data);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  deleteCategory: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/api/categories/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  // Brands
  getBrands: async (): Promise<Brand[]> => {
    const response = await apiClient.get<Brand[]>("/api/brands");
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  getBrandById: async (id: string): Promise<Brand> => {
    const response = await apiClient.get<Brand>(`/api/brands/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  createBrand: async (data: CreateBrandInput): Promise<Brand> => {
    const response = await apiClient.post<Brand>("/api/brands", data);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  updateBrand: async (id: string, data: UpdateBrandInput): Promise<Brand> => {
    const response = await apiClient.put<Brand>(`/api/brands/${id}`, data);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  deleteBrand: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/api/brands/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },
};

// Query keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters, pagination: PaginationOptions) =>
    [...productKeys.lists(), filters, pagination] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  stats: () => [...productKeys.all, "stats"] as const,
};

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export const brandKeys = {
  all: ["brands"] as const,
  lists: () => [...brandKeys.all, "list"] as const,
  details: () => [...brandKeys.all, "detail"] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
};

// Product Hooks
export function useProducts(
  filters: ProductFilters = {},
  pagination: PaginationOptions = {
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  }
) {
  return useQuery({
    queryKey: productKeys.list(filters, pagination),
    queryFn: () => productApi.getProducts(filters, pagination),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProductStats() {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: productApi.getProductStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productApi.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(updatedProduct.id),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

// Category Hooks
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: productApi.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => productApi.getCategoryById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      productApi.updateCategory(id, data),
    onSuccess: (updatedCategory) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(updatedCategory.id),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

// Brand Hooks
export function useBrands() {
  return useQuery({
    queryKey: brandKeys.lists(),
    queryFn: productApi.getBrands,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useBrand(id: string) {
  return useQuery({
    queryKey: brandKeys.detail(id),
    queryFn: () => productApi.getBrandById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandInput }) =>
      productApi.updateBrand(id, data),
    onSuccess: (updatedBrand) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: brandKeys.detail(updatedBrand.id),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}
