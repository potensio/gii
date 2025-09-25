"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/admin/products/product-table";
import { ProductStatsCards } from "@/components/admin/products/product-stats-cards";
import { createProductColumns } from "@/components/admin/products/product-table-columns";
import { useProducts } from "@/hooks/use-products";
import { CreateProductSheet } from "@/components/admin/products/create-product-sheet";

export default function ProductsPage() {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = React.useState([
    {
      id: "createdAt",
      desc: true,
    },
  ]);

  const [rowSelection, setRowSelection] = React.useState({});
  const [isCreateSheetOpen, setIsCreateSheetOpen] = React.useState(false);

  const {
    data: productsData,
    isLoading,
    error,
  } = useProducts(
    {}, // No filters for now
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortBy: "createdAt",
      sortOrder: sorting[0]?.desc ? "desc" : "asc",
    }
  );

  const columns = React.useMemo(() => createProductColumns(), []);

  if (error) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h3 className="mt-4 text-lg font-semibold">Error loading products</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            There was an error loading the products. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-medium tracking-tight">Products</h2>
        <Button onClick={() => setIsCreateSheetOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Product
        </Button>
      </div>

      <ProductStatsCards />

      <ProductTable
        data={productsData?.products || []}
        columns={columns}
        isLoading={isLoading}
      />

      <CreateProductSheet 
        isOpen={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
      />
    </div>
  );
}
