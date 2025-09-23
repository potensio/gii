import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user.service";

export async function GET(request: NextRequest) {
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
