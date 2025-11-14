import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user.service";
import { decodeUserId } from "@/lib/utils/token.utils";
import { formatErrorResponse, AuthorizationError } from "@/lib/errors";

// ==================== Route Handler ====================
export async function GET(request: NextRequest) {
  try {
    // Get token from request header
    const userId = decodeUserId(request);
    // If token is not present, return unauthorized response
    if (!userId) {
      throw new AuthorizationError("Unauthorized");
    }
    // Get user from database
    const user = await userService.getUserById(userId);
    // If user is not found, return not found response
    if (!user) {
      throw new AuthorizationError("User not found");
    }
    // Return user data with status 200
    return NextResponse.json(
      {
        success: true,
        message: "User data retrieved successfully",
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    // Return formatted error response with status code
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
