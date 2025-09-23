import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { loginFormSchema } from "@/lib/schemas/auth-schema";
import { getSecureCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginFormSchema.parse(body);

    // Attempt login
    const result = await authService.login(validatedData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 401 }
      );
    }

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: result.message,
      user: result.user,
      accessToken: result.tokens?.accessToken,
    });

    // Set refresh token as httpOnly cookie
    if (result.tokens?.refreshToken) {
      response.cookies.set(
        "refreshToken",
        result.tokens.refreshToken,
        getSecureCookieOptions()
      );
    }

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak valid",
          errors: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}
