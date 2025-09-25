import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/product.service";
import { updateCategorySchema } from "@/lib/schemas/product.schema";
import { withAuth } from "@/lib/middleware/auth.middleware";

interface RouteParams {
  params: {
    id: string;
  };
}

async function handleGET(request: NextRequest, { params }: RouteParams, user: any) {
  try {
    const category = await productService.getCategoryById(params.id);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

async function handlePUT(request: NextRequest, { params }: RouteParams, user: any) {
  try {
    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    const category = await productService.updateCategory(params.id, validatedData);

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);

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
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

async function handleDELETE(request: NextRequest, { params }: RouteParams, user: any) {
  try {
    await productService.deleteCategory(params.id);

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (error.message.includes("Cannot delete")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGET, { requiredRoles: ["ADMIN"] });
export const PUT = withAuth(handlePUT, { requiredRoles: ["ADMIN"] });
export const DELETE = withAuth(handleDELETE, { requiredRoles: ["ADMIN"] });