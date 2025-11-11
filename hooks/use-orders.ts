import { useQuery } from "@tanstack/react-query";
import type { InferSelectModel } from "drizzle-orm";
import { orders, orderItems, products } from "@/lib/db/schema";
import { toast } from "sonner";

// Type definitions
export type Order = InferSelectModel<typeof orders>;
export type OrderItem = InferSelectModel<typeof orderItems>;
export type Product = InferSelectModel<typeof products>;

export interface CompleteOrder {
  order: Order;
  orderItems: Array<{
    orderItem: OrderItem;
    product: Product | null;
  }>;
}

export interface OrderFilters {
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  page: number;
  pageSize: number;
}

// Response types
interface OrderListResponse {
  success: boolean;
  message: string;
  data: CompleteOrder[];
}

interface OrderDetailResponse {
  success: boolean;
  message: string;
  data: CompleteOrder | null;
}

// API functions
const orderApi = {
  // Get all orders with filters
  getOrders: async (filters: OrderFilters): Promise<OrderListResponse> => {
    // Build query params from filters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    // Send request to API
    const response = await fetch(`/api/admin/orders?${params}`, {
      credentials: "include",
    });

    // Check if response is ok
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to load orders");
    }

    // Parse response JSON
    return response.json();
  },

  // Get single order by ID
  getOrderById: async (id: string): Promise<OrderDetailResponse> => {
    const response = await fetch(`/api/admin/orders/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to load order");
    }

    return response.json();
  },
};

// Query hooks
export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => orderApi.getOrders(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      onError: (error: Error) => {
        toast.error(error.message || "Failed to load orders");
      },
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => orderApi.getOrderById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      onError: (error: Error) => {
        toast.error(error.message || "Failed to load order");
      },
    },
  });
}
