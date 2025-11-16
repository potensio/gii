import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { cartService } from "@/lib/services/cart.service";
import { getSessionId } from "@/lib/utils/session.utils";
import { formatErrorResponse, ValidationError } from "@/lib/errors";
import jwt from "jsonwebtoken";

/**
 * Request body interface for checkout
 */
interface CheckoutRequest {
  fullName: string;
  email: string;
  phone: string;
  addressLabel: string;
  fullAddress: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
}

/**
 * POST /api/checkout/guest
 * Process guest checkout: validate cart, create order, auto-register user, set auth cookie
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: CheckoutRequest = await request.json();

    // Validate session ID exists
    const sessionId = getSessionId(request);
    if (!sessionId) {
      throw new ValidationError("Session tidak ditemukan");
    }

    // Validate session has an associated cart in database
    const hasCart = await cartService.validateSession(sessionId);
    if (!hasCart) {
      throw new ValidationError("Keranjang tidak ditemukan untuk session ini");
    }

    // Fetch cart items from cart service
    const cartItems = await cartService.getCart(sessionId);

    // Validate cart is not empty
    if (cartItems.length === 0) {
      throw new ValidationError("Keranjang kosong");
    }

    // Validate cart items availability
    const validation = await cartService.validateCart(cartItems);
    if (!validation.valid) {
      // Build detailed error message for validation failures
      const errorMessages = validation.errors.map((error) => {
        if (error.type === "PRODUCT_UNAVAILABLE") {
          return `${error.message}`;
        } else if (error.type === "OUT_OF_STOCK") {
          return `${error.message}`;
        } else if (error.type === "PRICE_CHANGED") {
          return `${error.message}`;
        }
        return error.message;
      });

      throw new ValidationError(
        `Validasi keranjang gagal: ${errorMessages.join(", ")}`,
        { errors: validation.errors }
      );
    }

    // Call order service to create order
    const result = await orderService.createGuestOrder({
      customerEmail: body.email,
      customerName: body.fullName,
      customerPhone: body.phone,
      addressLabel: body.addressLabel,
      fullAddress: body.fullAddress,
      village: body.village,
      district: body.district,
      city: body.city,
      province: body.province,
      postalCode: body.postalCode,
      cartItems,
      sessionId,
    });

    // Generate auth token for new user
    const token = jwt.sign(
      {
        userId: result.userId,
        email: body.email,
        role: "user",
        isActive: true,
        isDeleted: false,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d", // 7 days
      }
    );

    // Create response with order data
    const response = NextResponse.json(
      {
        success: true,
        message: "Pesanan berhasil dibuat",
        data: {
          orderId: result.orderId,
          orderNumber: result.orderNumber,
        },
      },
      { status: 201 }
    );

    // Set HTTP-only auth cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    // Handle validation errors with appropriate messages
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
