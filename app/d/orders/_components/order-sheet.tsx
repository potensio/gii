"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CompleteOrder } from "@/hooks/use-orders";
import {
  formatCurrency,
  formatAddress,
  formatDateTime,
  formatStatus,
  getStatusVariant,
} from "@/lib/utils";

interface OrderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: CompleteOrder | null;
}

export function OrderSheet({
  isOpen,
  onClose,
  selectedOrder,
}: OrderSheetProps) {
  if (!selectedOrder) {
    return null;
  }

  const { order, orderItems } = selectedOrder;

  // Parse addresses
  let shippingAddress: any = {};
  let billingAddress: any = {};

  try {
    shippingAddress = JSON.parse(order.shippingAddress || "{}");
  } catch (e) {
    console.error("Failed to parse shipping address:", e);
  }

  try {
    billingAddress = JSON.parse(order.billingAddress || "{}");
  } catch (e) {
    console.error("Failed to parse billing address:", e);
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto px-0 py-4"
      >
        <div className="p-8">
          <h2 className="font-medium mb-2 text-base">Order Details</h2>
          <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
        </div>

        {/* Order Status Section */}
        <div className="p-8">
          <h2 className="font-medium mb-2 text-base">Status</h2>
          <div className="flex gap-2">
            <Badge variant={getStatusVariant(order.orderStatus)}>
              {formatStatus(order.orderStatus)}
            </Badge>
            <Badge variant={getStatusVariant(order.paymentStatus)}>
              {formatStatus(order.paymentStatus)}
            </Badge>
          </div>
        </div>

        {/* Customer Information Section */}
        <Separator />
        <div className="p-8 space-y-6">
          <h2 className="font-medium text-base">Informasi Pemesan</h2>
          <div className="space-y-6">
            <div className="flex flex-row gap-6">
              <p className="text-sm text-muted-foreground min-w-[120px]">
                Nama pemesan
              </p>
              <dd className="text-sm">{order.customerName}</dd>
            </div>
            <div className="flex flex-row gap-6">
              <p className="text-sm text-muted-foreground min-w-[120px]">
                Nomor handphone
              </p>
              <dd className="text-sm">0852 1181 9993</dd>
            </div>
            <div className="flex flex-row gap-6">
              <p className="text-sm text-muted-foreground min-w-[120px]">
                Alamat email
              </p>
              <dd className="text-sm">{order.customerEmail}</dd>
            </div>
            <div className="flex flex-row gap-6">
              <p className="text-sm text-muted-foreground min-w-[120px]">
                Alamat Pengiriman
              </p>
              <address className="text-sm not-italic">
                {formatAddress(shippingAddress)}
              </address>
            </div>
          </div>
        </div>

        {/* Order Items Section */}
        <Separator />
        <div className="p-8">
          <h2 className="font-medium mb-2 text-base">Order Items</h2>
          <div className="space-y-3">
            {orderItems.map((item) => (
              <div
                key={item.orderItem.id}
                className="flex justify-between text-sm"
              >
                <div>
                  <p className="font-medium">{item.orderItem.productName}</p>
                  <p className="text-muted-foreground">
                    SKU: {item.orderItem.productSku}
                  </p>
                  <p className="text-muted-foreground">
                    Qty: {item.orderItem.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    {formatCurrency(item.orderItem.subtotal, order.currency)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatCurrency(item.orderItem.unitPrice, order.currency)}{" "}
                    each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary Section */}
        <Separator />
        <div className="p-8">
          <h2 className="font-medium mb-2 text-base">Order Summary</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatCurrency(order.subtotal, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd>{formatCurrency(order.tax, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{formatCurrency(order.shippingCost, order.currency)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <dt>Discount</dt>
                <dd>-{formatCurrency(order.discount, order.currency)}</dd>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-medium">
              <dt>Total</dt>
              <dd>{formatCurrency(order.total, order.currency)}</dd>
            </div>
          </dl>
        </div>

        {/* Tracking Information (if available) */}
        {order.trackingNumber && (
          <>
            <Separator />
            <div>
              <h2 className="font-medium mb-2 text-base">
                Shipping Information
              </h2>
              <dl className="space-y-1 text-sm">
                {order.carrier && (
                  <div>
                    <dt className="text-muted-foreground">Carrier</dt>
                    <dd>{order.carrier}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Tracking Number</dt>
                  <dd>{order.trackingNumber}</dd>
                </div>
              </dl>
            </div>
          </>
        )}

        {/* Notes (if available) */}
        {(order.customerNotes || order.adminNotes) && (
          <>
            <Separator />
            <div>
              <h2 className="font-medium mb-2 text-base">Notes</h2>
              {order.customerNotes && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">
                    Customer Notes:
                  </p>
                  <p className="text-sm">{order.customerNotes}</p>
                </div>
              )}
              {order.adminNotes && (
                <div>
                  <p className="text-sm text-muted-foreground">Admin Notes:</p>
                  <p className="text-sm">{order.adminNotes}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Timestamps Section */}
        <Separator />
        <div className="p-8">
          <h2 className="font-medium mb-2 text-base">Timeline</h2>
          <dl className="space-y-1 text-sm">
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDateTime(order.createdAt)}</dd>
            </div>
            {order.paidAt && (
              <div>
                <dt className="text-muted-foreground">Paid</dt>
                <dd>{formatDateTime(order.paidAt)}</dd>
              </div>
            )}
            {order.shippedAt && (
              <div>
                <dt className="text-muted-foreground">Shipped</dt>
                <dd>{formatDateTime(order.shippedAt)}</dd>
              </div>
            )}
            {order.deliveredAt && (
              <div>
                <dt className="text-muted-foreground">Delivered</dt>
                <dd>{formatDateTime(order.deliveredAt)}</dd>
              </div>
            )}
          </dl>
        </div>
      </SheetContent>
    </Sheet>
  );
}
