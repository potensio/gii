import { NextRequest, NextResponse } from "next/server";
import { orderService, type OrderFilters } from "@/lib/services/order.service";
import { decodeUserRole } from "@/lib/utils/token.utils";
import { formatErrorResponse, AuthorizationError } from "@/lib/errors";

// ==================== Request Parsers ====================
function parseOrderFilters(searchParams: URLSearchParams): OrderFilters {
  return {
    search: searchParams.get("search") || undefined,
    orderStatus: searchParams.get("orderStatus") || undefined,
    paymentStatus: searchParams.get("paymentStatus") || undefined,
    page: parseInt(searchParams.get("page") || "1", 10),
    pageSize: parseInt(searchParams.get("pageSize") || "10", 10),
  };
}

// ==================== Route Handler ====================
export async function GET(request: NextRequest) {
  try {
    const viewerRole = decodeUserRole(request);

    // Check admin permission
    if (!viewerRole || !["admin", "super_admin"].includes(viewerRole)) {
      throw new AuthorizationError("Unauthorized");
    }

    const { searchParams } = new URL(request.url);
    const filters = parseOrderFilters(searchParams);

    const orders = await orderService.getOrders(filters, viewerRole);

    return NextResponse.json(
      {
        success: true,
        message: "Orders retrieved successfully",
        data: orders,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
