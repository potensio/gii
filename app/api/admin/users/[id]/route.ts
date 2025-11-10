import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user.service";
import { decodeUserRole } from "@/lib/utils/token.utils";
import { formatErrorResponse, AuthorizationError } from "@/lib/errors";

// GET /api/admin/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const viewerRole = decodeUserRole(request);

    if (!viewerRole) {
      throw new AuthorizationError("Akses ditolak. Hanya admin yang diizinkan");
    }

    const { id } = await params;
    const user = await userService.getUserById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User retrieved successfully",
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const viewerRole = decodeUserRole(request);

    if (
      !viewerRole ||
      (viewerRole !== "admin" && viewerRole !== "super_admin")
    ) {
      throw new AuthorizationError("Akses ditolak. Hanya admin yang diizinkan");
    }

    const body = await request.json();
    const { name, email, role, isActive } = body;

    // Validate input
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const { id } = await params;
    const updatedUser = await userService.updateUser(id, updateData);

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan atau gagal diupdate",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User berhasil diupdate",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE /api/admin/users/[id] - Soft delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const viewerRole = decodeUserRole(request);

    if (
      !viewerRole ||
      (viewerRole !== "admin" && viewerRole !== "super_admin")
    ) {
      throw new AuthorizationError("Akses ditolak. Hanya admin yang diizinkan");
    }

    const { id } = await params;
    const success = await userService.deleteUser(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan atau gagal dihapus",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User berhasil dihapus",
        data: null,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
