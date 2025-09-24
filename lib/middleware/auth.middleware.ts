import { NextRequest, NextResponse } from "next/server";
import { extractTokenFromHeader, verifyAccessToken } from "../auth";
import { authService } from "../services/auth.service";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to authenticate requests using JWT tokens
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ success: boolean; user?: any; response?: NextResponse }> {
  try {
    // Get access token from cookie instead of header
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return {
        success: false,
        response: NextResponse.json(
          { 
            success: false, 
            message: "Token akses tidak ditemukan" 
          },
          { status: 401 }
        ),
      };
    }

    // Verify access token
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      return {
        success: false,
        response: NextResponse.json(
          { 
            success: false, 
            message: "Token akses tidak valid" 
          },
          { status: 401 }
        ),
      };
    }

    // Get user profile to ensure user still exists and is active
    const userResult = await authService.getProfile(payload.userId);

    if (!userResult.success || !userResult.user) {
      return {
        success: false,
        response: NextResponse.json(
          { 
            success: false, 
            message: userResult.message || "User tidak ditemukan" 
          },
          { status: 401 }
        ),
      };
    }

    return {
      success: true,
      user: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        profile: userResult.user,
      },
    };
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return {
      success: false,
      response: NextResponse.json(
        { 
          success: false, 
          message: "Terjadi kesalahan autentikasi" 
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(allowedRoles: string[]) {
  return (user: any): { success: boolean; response?: NextResponse } => {
    if (!user || !allowedRoles.includes(user.role)) {
      return {
        success: false,
        response: NextResponse.json(
          { 
            success: false, 
            message: "Akses ditolak. Anda tidak memiliki izin yang diperlukan." 
          },
          { status: 403 }
        ),
      };
    }

    return { success: true };
  };
}

/**
 * Higher-order function to protect API routes
 */
export function withAuth(
  handler: (request: NextRequest, context: any, user: any) => Promise<NextResponse>,
  options: {
    requiredRoles?: string[];
  } = {}
) {
  return async (request: NextRequest, context: any) => {
    // Authenticate request
    const authResult = await authenticateRequest(request);

    if (!authResult.success) {
      return authResult.response!;
    }

    // Check role requirements if specified
    if (options.requiredRoles && options.requiredRoles.length > 0) {
      const roleCheck = requireRole(options.requiredRoles)(authResult.user);
      if (!roleCheck.success) {
        return roleCheck.response!;
      }
    }

    // Call the original handler with authenticated user
    return handler(request, context, authResult.user);
  };
}

/**
 * Utility function to check if user is admin
 */
export function requireAdmin() {
  return requireRole(['ADMIN']);
}

/**
 * Utility function to check if user is admin or moderator
 */
export function requireAdminOrModerator() {
  return requireRole(['ADMIN', 'MODERATOR']);
}