"use client";

import { useState } from "react";
import { OrderFilters } from "./_components/order-filters";
import { OrderTable } from "./_components/order-table";
import { OrderSheet } from "./_components/order-sheet";
import {
  useOrders,
  CompleteOrder,
  OrderFilters as OrderFiltersType,
} from "@/hooks/use-orders";

export default function OrdersPage() {
  // State management for filters
  const [filters, setFilters] = useState<OrderFiltersType>({
    search: "",
    orderStatus: "all",
    paymentStatus: "all",
    page: 1,
    pageSize: 10,
  });

  // State management for selected order and sheet
  const [selectedOrder, setSelectedOrder] = useState<CompleteOrder | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch orders using TanStack Query hook
  const { data: ordersData, isLoading, error } = useOrders(filters);

  // Filter change handlers
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleOrderStatusFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, orderStatus: value, page: 1 }));
  };

  const handlePaymentStatusFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, paymentStatus: value, page: 1 }));
  };

  // Row click handler - opens sheet with selected order
  const handleRowClick = (order: CompleteOrder) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  // Sheet close handler - resets selected order
  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">Order</h1>
        {/* <Button
          size={"sm"}
          onClick={handleAddUser}
          className="rounded-full size-8"
        >
          <Plus className="size-6" />
        </Button> */}
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error loading orders. Please try again.
          </p>
        </div>
      )}

      {/* Order Filters */}
      <OrderFilters
        searchValue={filters.search || ""}
        onSearchChange={handleSearchChange}
        orderStatusFilter={filters.orderStatus || "all"}
        onOrderStatusFilterChange={handleOrderStatusFilterChange}
        paymentStatusFilter={filters.paymentStatus || "all"}
        onPaymentStatusFilterChange={handlePaymentStatusFilterChange}
      />

      {/* Order Table */}
      <OrderTable
        orders={ordersData?.data || []}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />

      {/* Order Sheet */}
      <OrderSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        selectedOrder={selectedOrder}
      />
    </div>
  );
}
