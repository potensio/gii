import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { decodeUserRole } from "@/lib/utils/token.utils";
import {
  formatErrorResponse,
  AuthorizationError,
  NotFoundError,
} from "@/lib/errors";

// ==================== Route Handler ====================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const viewerRole = decodeUserRole(request);

    // Check admin permission
    if (!viewerRole || !["admin", "super_admin"].includes(viewerRole)) {
      throw new AuthorizationError("Unauthorized");
    }

    const { id: orderId } = await params;

    const order = await orderService.getOrderById(orderId, viewerRole);

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order retrieved successfully",
        data: order,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
