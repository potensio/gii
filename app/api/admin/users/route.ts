import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user.service";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Helper function to verify admin access
async function verifyAdminAccess(request: NextRequest) {
  try {
    // Get token from cookies (same as middleware)
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user[0] || !user[0].isActive || user[0].isDeleted) {
      return { success: false, message: "User tidak valid" };
    }

    // Check if user is admin or super_admin
    if (user[0].role !== "admin" && user[0].role !== "super_admin") {
      return {
        success: false,
        message: "Akses ditolak. Hanya admin yang diizinkan",
      };
    }

    return { success: true, user: user[0] };
  } catch (error) {
    return { success: false, message: "Token tidak valid" };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdminAccess(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") as
      | "user"
      | "admin"
      | "super_admin"
      | undefined;
    const isActiveParam = searchParams.get("isActive");
    const isActive = isActiveParam ? isActiveParam === "true" : undefined;

    // Get users from service
    const result = await userService.getUsers({
      page,
      search,
      role,
      isActive,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get users API error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
