import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "@/lib/utils/token.utils";
import { getSessionId, setSessionCookie } from "@/lib/utils/session.utils";
import {
  formatErrorResponse,
  AuthorizationError,
  ValidationError,
} from "@/lib/errors";
import { cartService } from "@/lib/services/cart.service";

/**
 * GET /api/cart
 * Load cart for authenticated user or guest
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID or session ID
    const userId = decodeUserId(request);
    const sessionId = getSessionId(request);
    const identifier = userId || sessionId;

    if (!identifier) {
      throw new AuthorizationError("No valid session");
    }

    // Load cart from database
    const cartItems = await cartService.getCart(identifier);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Cart loaded successfully",
        data: {
          items: cartItems,
          lastUpdated: Date.now(),
          sessionId: !userId ? sessionId : undefined, // Include session ID for guest users
        },
      },
      { status: 200 }
    );

    // Set session cookie if this is a guest user
    if (!userId) {
      setSessionCookie(response, sessionId);
    }

    return response;
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}

/**
 * POST /api/cart
 * Add item to cart for authenticated user or guest
 */
export async function POST(request: NextRequest) {
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
    const { product, quantity } = body;

    // Validate input
    if (!product || !quantity) {
      throw new ValidationError("Product and quantity required");
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      throw new ValidationError("Quantity must be a positive number");
    }

    // Delegate to service
    await cartService.addItem(identifier, product, quantity);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Item added to cart",
        data: { lastUpdated: Date.now() },
      },
      { status: 201 }
    );

    // Set session cookie if this is a guest user
    if (!userId) {
      setSessionCookie(response, sessionId);
    }

    return response;
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}

/**
 * DELETE /api/cart
 * Clear all items from cart for authenticated user or guest
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get user ID or session ID
    const userId = decodeUserId(request);
    const sessionId = getSessionId(request);
    const identifier = userId || sessionId;

    if (!identifier) {
      throw new AuthorizationError("No valid session");
    }

    // Delegate to service
    await cartService.clearCart(identifier);

    return NextResponse.json(
      {
        success: true,
        message: "Cart cleared successfully",
        data: { lastUpdated: Date.now() },
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
