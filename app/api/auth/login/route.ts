import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { loginSchema } from "@/lib/validations/auth.validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Call auth service
    const result = await authService.generateMagicLink(validatedData);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Terjadi kesalahan server" },
        { status: 500 }
      );
    }

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Login API Error:", error);

    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak valid",
          errors: error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
