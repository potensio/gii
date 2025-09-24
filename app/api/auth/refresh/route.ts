import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { verifyRefreshToken, getSecureCookieOptions, getAccessTokenCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Refresh token tidak ditemukan" 
        },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    if (!payload) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Refresh token tidak valid" 
        },
        { status: 401 }
      );
    }

    // Generate new token pair
    const result = await authService.refreshToken(refreshToken);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message 
        },
        { status: 401 }
      );
    }

    // Create response with user data (without accessToken in body)
    const response = NextResponse.json({
      success: true,
      message: result.message,
      user: result.user,
    });

    // Set new access token as httpOnly cookie
    if (result.tokens?.accessToken) {
      response.cookies.set(
        'accessToken',
        result.tokens.accessToken,
        getAccessTokenCookieOptions()
      );
    }

    // Set new refresh token as httpOnly cookie
    if (result.tokens?.refreshToken) {
      response.cookies.set(
        'refreshToken',
        result.tokens.refreshToken,
        getSecureCookieOptions()
      );
    }

    return response;
  } catch (error) {
    console.error("Refresh token API error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan server" 
      },
      { status: 500 }
    );
  }
}