import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/middleware/auth.middleware";
import { authService } from "@/lib/services/auth.service";

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    
    if (!authResult.success || !authResult.user) {
      return authResult.response || NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized" 
        },
        { status: 401 }
      );
    }

    // Get user profile
    const profileResult = await authService.getProfile(authResult.user.userId);
    
    if (!profileResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: profileResult.message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: profileResult.message,
      user: profileResult.user,
    });

  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}