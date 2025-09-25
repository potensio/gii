import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/product.service";
import { createCategorySchema } from "@/lib/schemas/product.schema";
import { withAuth } from "@/lib/middleware/auth.middleware";

async function handleGET(request: NextRequest, context: any, user: any) {
  try {
    const categories = await productService.getAllCategories();

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

async function handlePOST(request: NextRequest, context: any, user: any) {
  try {
    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    const createdCategory = await productService.createCategory(validatedData);

    return NextResponse.json(createdCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);

    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      if (error.message.includes("validation")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGET, { requiredRoles: ["ADMIN"] });
export const POST = withAuth(handlePOST, { requiredRoles: ["ADMIN"] });