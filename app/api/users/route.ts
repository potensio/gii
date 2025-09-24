import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user.service";
import {
  createUserSchema,
  userFiltersSchema,
  paginationSchema,
} from "@/lib/schemas/user.schema";
import { withAuth } from "@/lib/middleware/auth.middleware";

// FIX: Tambahkan context dan user parameter
async function handleGET(request: NextRequest, context: any, user: any) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters with proper validation
    const rawFilters = {
      role: searchParams.get("role") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    };

    // Parse pagination with proper validation
    const rawPagination = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    // Validate using schemas
    const filters = userFiltersSchema.parse(rawFilters);
    const pagination = paginationSchema.parse(rawPagination);

    const result = await userService.getUsers(filters, pagination);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

// FIX: Tambahkan context dan user parameter
async function handlePOST(request: NextRequest, context: any, user: any) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    const createdUser = await userService.createUser(validatedData);

    return NextResponse.json(createdUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      if (error.message.includes("validation")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGET, { requiredRoles: ["ADMIN"] });
export const POST = withAuth(handlePOST, { requiredRoles: ["ADMIN"] });
