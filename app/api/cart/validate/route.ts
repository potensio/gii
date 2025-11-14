import { NextRequest, NextResponse } from "next/server";
import { formatErrorResponse, ValidationError } from "@/lib/errors";
import { cartService } from "@/lib/services/cart.service";
import type { CartItem } from "@/lib/types/cart.types";

/**
 * POST /api/cart/validate
 * Validates cart items against current product data
 * Checks availability, stock, and price changes
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { items } = body as { items: CartItem[] };

    if (!items || !Array.isArray(items)) {
      throw new ValidationError("Invalid request: items array required");
    }

    // Validate cart items
    const validationResult = await cartService.validateCart(items);

    return NextResponse.json(
      {
        success: true,
        message: "Cart validated successfully",
        data: validationResult,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
