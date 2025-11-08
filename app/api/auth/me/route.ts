import { NextRequest } from "next/server";
import { userService } from "@/lib/services/user.service";
import jwt from "jsonwebtoken";

async function GET(request: NextRequest) {
  // Get token from request header
  const token = request.headers.get("Authorization")?.split(" ")[1];

  // If token is not present, return unauthorized response
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }
}
