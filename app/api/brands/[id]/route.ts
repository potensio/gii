import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/product.service";
import { updateBrandSchema } from "@/lib/schemas/product.schema";
import { withAuth } from "@/lib/middleware/auth.middleware";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

async function handleGET(request: NextRequest, { params }: RouteParams, user: any) {
  try {
    const { id } = await params;
    const brand = await productService.getBrandById(id);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}

async function handlePUT(request: NextRequest, { params }: RouteParams, user: any) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateBrandSchema.parse(body);

    const brand = await productService.updateBrand(id, validatedData);

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error updating brand:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (
        error.message.includes("validation") ||
        error.message.includes("already exists")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 }
    );
  }
}

async function handleDELETE(request: NextRequest, { params }: RouteParams, user: any) {
  try {
    const { id } = await params;
    await productService.deleteBrand(id);

    return NextResponse.json(
      { message: "Brand deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting brand:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (error.message.includes("Cannot delete")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Failed to delete brand" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGET, { requiredRoles: ["ADMIN"] });
export const PUT = withAuth(handlePUT, { requiredRoles: ["ADMIN"] });
export const DELETE = withAuth(handleDELETE, { requiredRoles: ["ADMIN"] });