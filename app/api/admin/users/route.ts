import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user.service";
import { UserFilters } from "@/hooks/use-users";
import { decodeUserRole } from "@/lib/utils/token.utils";
import { formatErrorResponse } from "@/lib/errors";

// ==================== Request Parsers ====================
function parseUserFilters(searchParams: URLSearchParams): UserFilters {
  const isActiveParam = searchParams.get("isActive");

  return {
    status: searchParams.get("status") || undefined,
    role:
      (searchParams.get("role") as "user" | "admin" | "super_admin" | "") ||
      undefined,
    search: searchParams.get("search") || undefined,
    page: parseInt(searchParams.get("page") || "1", 10),
    pageSize: parseInt(searchParams.get("pageSize") || "10", 10),
    isActive: isActiveParam ? isActiveParam === "true" : undefined,
  };
}

// ==================== Route Handler ====================
export async function GET(request: NextRequest) {
  try {
    const viewerRole = decodeUserRole(request);
    const { searchParams } = new URL(request.url);
    const filters = parseUserFilters(searchParams);

    const result = await userService.getUsers({
      page: filters.page,
      search: filters.search,
      role: filters.role as "user" | "admin" | "super_admin" | undefined,
      isActive: filters.isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Users retrieved successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
