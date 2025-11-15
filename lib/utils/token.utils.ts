import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { UserRole } from "@/lib/enums";

export function extractToken(request: NextRequest): string | undefined {
  // Try 'token' first, then fallback to 'auth-token'
  return (
    request.cookies.get("token")?.value ||
    request.cookies.get("auth-token")?.value
  );
}

export function decodeUserRole(request: NextRequest): UserRole | undefined {
  try {
    const token = extractToken(request);

    if (!token) {
      return undefined;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      role?: UserRole;
      userId?: string;
    };
    return decoded.role;
  } catch (error) {
    return undefined;
  }
}

export function decodeUserId(request: NextRequest): string | undefined {
  try {
    const token = extractToken(request);
    if (!token) return undefined;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId?: string;
    };
    return decoded.userId;
  } catch {
    return undefined;
  }
}
