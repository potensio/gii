import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/product.service";
import { ProductFilters } from "@/hooks/use-products";
import { UserRole } from "@/lib/enums";
import { formatErrorResponse } from "@/lib/errors";
import { extractThumbnail, getLowestPrice } from "@/lib/utils/product.utils";

// ==================== Types ====================
interface SimplifiedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  slug: string;
  price: number;
  thumbnailUrl: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface ProductQueryParams {
  sortBy?: "newest" | "random";
  limit?: number;
  isActive?: boolean;
}

// ==================== Request Parsers ====================
function parseQueryParams(searchParams: URLSearchParams): ProductQueryParams {
  const sortBy = searchParams.get("sortBy");
  const limit = searchParams.get("limit");
  const isActive = searchParams.get("isActive");

  return {
    sortBy: sortBy === "newest" || sortBy === "random" ? sortBy : "newest",
    limit: limit ? parseInt(limit, 10) : 10,
    isActive: isActive !== null ? isActive === "true" : true,
  };
}

// ==================== Route Handler ====================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = parseQueryParams(searchParams);

    // Build filters for product service
    const filters: ProductFilters = {
      isActive: queryParams.isActive,
      sortBy: queryParams.sortBy,
    };

    // Fetch products using product service with 'user' role (public access)
    const result = await productService.getProductGroups(filters, "user");

    // Transform CompleteProduct[] to SimplifiedProduct[]
    const simplifiedProducts: SimplifiedProduct[] = result.products.map(
      (cp) => ({
        id: cp.productGroup.id,
        name: cp.productGroup.name,
        brand: cp.productGroup.brand,
        category: cp.productGroup.category,
        slug: cp.productGroup.slug,
        price: getLowestPrice(cp.products),
        thumbnailUrl: extractThumbnail(cp.productGroup.images),
        isActive: cp.productGroup.isActive,
        createdAt: cp.productGroup.createdAt,
      })
    );

    // Apply limit (note: this is now handled by the service layer, but keeping for backwards compatibility)
    const limitedProducts = simplifiedProducts.slice(0, queryParams.limit);

    return NextResponse.json(
      {
        success: true,
        message: "Products retrieved successfully",
        data: limitedProducts,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
