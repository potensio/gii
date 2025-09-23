import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { extractTokenFromHeader, verifyAccessToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get access token from header
    const authHeader = request.headers.get('authorization');
    const accessToken = extractTokenFromHeader(authHeader);
    
    if (!accessToken) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Token akses tidak ditemukan" 
        },
        { status: 401 }
      );
    }

    // Verify access token
    const payload = verifyAccessToken(accessToken);
    
    if (!payload) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Token akses tidak valid" 
        },
        { status: 401 }
      );
    }

    // Get user profile
    const result = await authService.getProfile(payload.userId);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      user: result.user,
    });
  } catch (error) {
    console.error("Get profile API error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan server" 
      },
      { status: 500 }
    );
  }
}