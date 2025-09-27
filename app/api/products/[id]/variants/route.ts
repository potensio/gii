import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/product.service";
import { createVariantSchema } from "@/lib/schemas/product.schema";
import { withAuth } from "@/lib/middleware/auth.middleware";

async function handlePOST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
  user: any
) {
  try {
    const { id: productId } = await context.params;
    const body = await request.json();

    // Add productId to the request body
    const variantData = {
      ...body,
      productId,
    };

    const validatedData = createVariantSchema.parse(variantData);
    const createdVariant = await productService.createVariant(validatedData);

    return NextResponse.json(createdVariant, { status: 201 });
  } catch (error) {
    console.error("Error creating variant:", error);

    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      if (
        error.message.includes("validation") ||
        error.message.includes("not found")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handlePOST, { requiredRoles: ["ADMIN"] });