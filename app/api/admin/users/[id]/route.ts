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
      return { success: false, message: "Noxx authentication token found" };
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

// GET /api/admin/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const authResult = await verifyAdminAccess(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 }
      );
    }

    const user = await userService.getUserById(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID API error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const authResult = await verifyAdminAccess(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, role, isActive } = body;

    // Validate input
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await userService.updateUser(params.id, updateData);

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan atau gagal diupdate" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User berhasil diupdate",
    });
  } catch (error) {
    console.error("Update user API error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Soft delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const authResult = await verifyAdminAccess(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 }
      );
    }

    const success = await userService.deleteUser(params.id);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan atau gagal dihapus" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete user API error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
