import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/product.service";
import {
  createProductSchema,
  productFiltersSchema,
  productPaginationSchema,
} from "@/lib/schemas/product.schema";
import { withAuth } from "@/lib/middleware/auth.middleware";

async function handleGET(request: NextRequest, context: any, user: any) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters with proper validation
    const rawFilters = {
      status: searchParams.get("status") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      brandId: searchParams.get("brandId") || undefined,
      search: searchParams.get("search") || undefined,
      minPrice: searchParams.get("minPrice")
        ? parseFloat(searchParams.get("minPrice")!)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseFloat(searchParams.get("maxPrice")!)
        : undefined,
    };

    // Parse pagination with proper validation
    const rawPagination = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    // Validate using schemas
    const filters = productFiltersSchema.parse(rawFilters);
    const pagination = productPaginationSchema.parse(rawPagination);

    const result = await productService.getProducts(filters, pagination);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

async function handlePOST(request: NextRequest, context: any, user: any) {
  try {
    // Handle JSON data only
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);
    const createdProduct = await productService.createProduct(validatedData);
    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);

    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      if (error.message.includes("validation")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGET, { requiredRoles: ["ADMIN"] });
export const POST = withAuth(handlePOST, { requiredRoles: ["ADMIN"] });
