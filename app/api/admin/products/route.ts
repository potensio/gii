import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/product.service";
import { UserRole } from "@/lib/enums";
import { ProductFilters } from "@/hooks/use-products";
import jwt from "jsonwebtoken";

// ==================== Token Utils ====================
function extractToken(request: NextRequest): string | undefined {
  return request.cookies.get("token")?.value;
}

function decodeUserRole(request: NextRequest): UserRole | undefined {
  try {
    const token = extractToken(request);
    if (!token) return undefined;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      role?: UserRole;
    };

    return decoded.role;
  } catch {
    return undefined;
  }
}

// ==================== Request Parsers ====================
function parseProductFilters(searchParams: URLSearchParams): ProductFilters {
  const isActiveParam = searchParams.get("isActive");

  return {
    category: searchParams.get("category") || undefined,
    brand: searchParams.get("brand") || undefined,
    search: searchParams.get("search") || undefined,
    isActive: isActiveParam ? isActiveParam === "true" : undefined,
  };
}

// ==================== Error Handlers ====================
function handleForbiddenError() {
  return NextResponse.json(
    {
      success: false,
      message: "Akses ditolak. Hanya admin yang diizinkan",
    },
    { status: 403 }
  );
}

function handleServerError(error: unknown) {
  console.error("Get products API error:", error);

  return NextResponse.json(
    {
      success: false,
      message: "Terjadi kesalahan server",
    },
    { status: 500 }
  );
}

function isForbiddenError(error: any): boolean {
  return error?.message === "FORBIDDEN";
}

// ==================== Route Handler ====================
export async function GET(request: NextRequest) {
  try {
    const viewerRole = decodeUserRole(request);
    const { searchParams } = new URL(request.url);
    const filters = parseProductFilters(searchParams);

    if (!viewerRole) {
      return handleForbiddenError();
    }

    const products = await productService.getProducts(
      {
        ...filters,
      },
      viewerRole
    );

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    if (isForbiddenError(error)) {
      return handleForbiddenError();
    }

    return handleServerError(error);
  }
}
