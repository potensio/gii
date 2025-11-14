import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "@/lib/utils/token.utils";
import {
  formatErrorResponse,
  AuthorizationError,
  ValidationError,
} from "@/lib/errors";
import { cartService } from "@/lib/services/cart.service";

/**
 * POST /api/cart/claim
 * Claim guest cart and merge with authenticated user's cart
 */
export async function POST(request: NextRequest) {
  try {
    // Must be authenticated to claim a cart
    const userId = decodeUserId(request);

    if (!userId) {
      throw new AuthorizationError("Must be authenticated to claim cart");
    }

    // Parse request body
    const body = await request.json();
    const { guestId } = body;

    // Validate input
    if (!guestId) {
      throw new ValidationError("Guest ID required");
    }

    // Delegate to service
    await cartService.claimGuestCart(guestId, userId);

    return NextResponse.json(
      {
        success: true,
        message: "Cart claimed successfully",
        data: { lastUpdated: Date.now() },
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
