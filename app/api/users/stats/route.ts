import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user.service";
import { withAuth } from "@/lib/middleware/auth.middleware";

async function handleGET(request: NextRequest, context: any, user: any) {
  try {
    const stats = await userService.getUserStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGET, { requiredRoles: ["ADMIN"] });
