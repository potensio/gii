import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/product.service";
import { withAuth } from "@/lib/middleware/auth.middleware";

async function handleGET(request: NextRequest, context: any, user: any) {
  try {
    const stats = await productService.getProductStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching product stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch product statistics" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGET, { requiredRoles: ["ADMIN"] });
