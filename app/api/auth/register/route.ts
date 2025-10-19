import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { registerSchema } from "@/lib/validations/auth.validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Call auth service
    const result = await authService.register(validatedData);
    
    if (!result) {
      return NextResponse.json(
        { success: false, message: "Terjadi kesalahan server" },
        { status: 500 }
      );
    }
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Register API Error:", error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { 
          success: false, 
          message: "Data tidak valid",
          errors: error
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