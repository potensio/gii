import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "@/lib/utils/token.utils";
import { getSessionId } from "@/lib/utils/session.utils";
import {
  formatErrorResponse,
  AuthorizationError,
  ValidationError,
} from "@/lib/errors";
import { cartService } from "@/lib/services/cart.service";

/**
 * DELETE /api/cart/[itemId]
 * Remove item from cart for authenticated user or guest
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    // Get user ID or session ID
    const userId = decodeUserId(request);
    const sessionId = getSessionId(request);
    const identifier = userId || sessionId;

    if (!identifier) {
      throw new AuthorizationError("No valid session");
    }

    // Delegate to service
    await cartService.removeItem(identifier, params.itemId);

    return NextResponse.json(
      {
        success: true,
        message: "Item removed from cart",
        data: { lastUpdated: Date.now() },
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}

/**
 * PATCH /api/cart/[itemId]
 * Update item quantity in cart for authenticated user or guest
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    // Get user ID or session ID
    const userId = decodeUserId(request);
    const sessionId = getSessionId(request);
    const identifier = userId || sessionId;

    if (!identifier) {
      throw new AuthorizationError("No valid session");
    }

    // Parse request body
    const body = await request.json();
    const { quantity } = body;

    // Validate input
    if (typeof quantity !== "number") {
      throw new ValidationError("Quantity must be a number");
    }

    // Delegate to service
    await cartService.updateQuantity(identifier, params.itemId, quantity);

    return NextResponse.json(
      {
        success: true,
        message: "Quantity updated",
        data: { lastUpdated: Date.now() },
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
