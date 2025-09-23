import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user.service";
import { inviteUserSchema } from "@/lib/schemas/user.schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = inviteUserSchema.parse(body);

    const result = await userService.inviteUser(validatedData);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error inviting user:", error);

    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      if (error.message.includes("validation")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Failed to invite user" },
      { status: 500 }
    );
  }
}
