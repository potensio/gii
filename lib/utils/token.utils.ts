import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { UserRole } from "@/lib/enums";

export function extractToken(request: NextRequest): string | undefined {
  return request.cookies.get("token")?.value;
}

export function decodeUserRole(request: NextRequest): UserRole | undefined {
  try {
    const token = extractToken(request);
    if (!token) return undefined;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      role?: UserRole;
    };
    return decoded.role;
  } catch {
    return undefined;
  }
}