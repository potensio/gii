import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { extractTokenFromHeader, verifyAccessToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get access token from header
    const authHeader = request.headers.get('authorization');
    const accessToken = extractTokenFromHeader(authHeader);
    
    if (accessToken) {
      // Verify and get user info from token
      const payload = verifyAccessToken(accessToken);
      
      if (payload) {
        // Perform logout (this could invalidate refresh tokens in the future)
        await authService.logout(payload.userId);
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logout berhasil",
    });

    // Clear refresh token cookie
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    
    // Even if there's an error, we should still clear the cookie
    const response = NextResponse.json(
      { 
        success: true, 
        message: "Logout berhasil" 
      },
      { status: 200 }
    );

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}