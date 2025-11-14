"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCurrency,
  formatDateTime,
  formatStatus,
  getStatusVariant,
} from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  shippingAddress: string;
  customerNotes: string | null;
  createdAt: string;
  orderItems: OrderItem[];
}

interface MyOrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
}

export default function MyOrderPage() {
  const { me, isMeLoading } = useAuth();
  const searchParams = useSearchParams();
  const highlightOrderId = searchParams.get("orderId");
  const orderRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fetch user orders
  const ordersQuery = useQuery<MyOrdersResponse>({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders/my-orders", {
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch orders");
      }
      return response.json();
    },
    enabled: !!me?.data?.id,
  });

  // Scroll to highlighted order on mount
  useEffect(() => {
    if (highlightOrderId && orderRefs.current[highlightOrderId]) {
      setTimeout(() => {
        orderRefs.current[highlightOrderId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [highlightOrderId, ordersQuery.data]);

  // Parse shipping address
  const parseAddress = (addressJson: string) => {
    try {
      const address = JSON.parse(addressJson);
      return `${address.recipientName}, ${address.phone}, ${address.fullAddress}, ${address.city}, ${address.province} ${address.postalCode}`;
    } catch {
      return addressJson;
    }
  };

  // Loading state
  if (isMeLoading || ordersQuery.isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Pesanan Saya</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (ordersQuery.isError) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Pesanan Saya</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Terjadi kesalahan saat memuat pesanan. Silakan coba lagi.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orders = ordersQuery.data?.data || [];

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Pesanan Saya</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Anda belum memiliki pesanan
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Pesanan Anda akan muncul di sini setelah checkout
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Pesanan Saya</h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const isHighlighted = order.id === highlightOrderId;

          return (
            <Card
              key={order.id}
              ref={(el) => {
                orderRefs.current[order.id] = el;
              }}
              className={isHighlighted ? "ring-2 ring-primary" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {order.orderNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateTime(order.createdAt)} (
                      {dayjs(order.createdAt).fromNow()})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusVariant(order.orderStatus)}>
                      {formatStatus(order.orderStatus)}
                    </Badge>
                    <Badge variant={getStatusVariant(order.paymentStatus)}>
                      {formatStatus(order.paymentStatus)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Item Pesanan</h3>
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.productSku}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Jumlah: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(item.subtotal, order.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.unitPrice, order.currency)} /
                          item
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold text-sm mb-2">
                    Alamat Pengiriman
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {parseAddress(order.shippingAddress)}
                  </p>
                </div>

                {/* Customer Notes */}
                {order.customerNotes && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Catatan</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.customerNotes}
                    </p>
                  </div>
                )}

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>
                        {formatCurrency(order.subtotal, order.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Ongkos Kirim
                      </span>
                      <span>
                        {formatCurrency(order.shippingCost, order.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>{formatCurrency(order.total, order.currency)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
