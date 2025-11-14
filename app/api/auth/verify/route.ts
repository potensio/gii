import { NextResponse, NextRequest } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { cartService } from "@/lib/services/cart.service";
import { getSessionId } from "@/lib/utils/session.utils";

export async function POST(req: NextRequest) {
  try {
    const { code, type } = await req.json();

    if (!code || !type) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Format JSON tidak valid",
        },
        { status: 400 }
      );
    }
    let result: { success: boolean; message: string; data: any };

    switch (type) {
      case "register":
        result = await authService.verifyRegister(code, type);
        break;
      case "login":
        result = await authService.verifyLogin(code, type);
        break;
      default:
        return NextResponse.json(
          { success: false, data: null, message: "Invalid type" },
          { status: 400 }
        );
    }

    // Migrate guest cart to user cart after successful login
    if (result.success && result.data?.user?.id) {
      try {
        const sessionId = getSessionId(req);
        if (sessionId) {
          await cartService.migrateGuestCart(sessionId, result.data.user.id);
        }
      } catch (migrationError) {
        // Log error but don't block login
        console.error("Cart migration failed:", migrationError);
      }
    }

    // Return result to client
    const response = NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });

    // Set HTTP-only cookie if login is successful
    if (result.success && result.data?.token) {
      response.cookies.set("token", result.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, message: "Could not verify code" },
      { status: 400 }
    );
  }
}
