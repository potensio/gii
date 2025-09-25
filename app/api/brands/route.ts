import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/product.service";
import { createBrandSchema } from "@/lib/schemas/product.schema";
import { withAuth } from "@/lib/middleware/auth.middleware";

async function handleGET(request: NextRequest, context: any, user: any) {
  try {
    const brands = await productService.getAllBrands();

    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

async function handlePOST(request: NextRequest, context: any, user: any) {
  try {
    const body = await request.json();
    const validatedData = createBrandSchema.parse(body);

    const createdBrand = await productService.createBrand(validatedData);

    return NextResponse.json(createdBrand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);

    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      if (error.message.includes("validation")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGET, { requiredRoles: ["ADMIN"] });
export const POST = withAuth(handlePOST, { requiredRoles: ["ADMIN"] });