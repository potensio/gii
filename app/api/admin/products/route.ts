import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/product.service";
import { UserRole } from "@/lib/enums";
import { ProductFilters } from "@/hooks/use-products";
import { decodeUserRole } from "@/lib/utils/token.utils";
import { formatErrorResponse, AuthorizationError } from "@/lib/errors";

// ==================== Request Parsers ====================
function parseProductFilters(searchParams: URLSearchParams): ProductFilters {
  const isActiveParam = searchParams.get("isActive");

  return {
    category: searchParams.get("category") || undefined,
    brand: searchParams.get("brand") || undefined,
    search: searchParams.get("search") || undefined,
    page: parseInt(searchParams.get("page") || "1", 10),
    pageSize: parseInt(searchParams.get("pageSize") || "10", 10),
    isActive: isActiveParam ? isActiveParam === "true" : undefined,
  };
}

// ==================== Route Handler ====================
export async function GET(request: NextRequest) {
  try {
    const viewerRole = decodeUserRole(request);
    const { searchParams } = new URL(request.url);
    const filters = parseProductFilters(searchParams);

    if (!viewerRole) {
      throw new AuthorizationError("Akses ditolak. Hanya admin yang diizinkan");
    }

    const products = await productService.getProducts(filters, viewerRole);

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    console.error("API Error [GET /api/admin/products]:", error);
    return NextResponse.json(response, { status: statusCode });
  }
}
