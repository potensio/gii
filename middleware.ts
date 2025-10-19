import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get token from cookies
  const token = req.cookies.get("token")?.value;

  // Check if path starts with /d (protected route)
  const isProtectedRoute = pathname.startsWith("/d");

  // If not protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // If no token, redirect to auth
  if (!token) {
    console.log("Middleware - No token, redirecting to /auth");
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  // Verify token using jose (Edge Runtime compatible)
  return verifyTokenAsync(token, req);
}

async function verifyTokenAsync(token: string, req: NextRequest) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    console.log("Middleware - Token valid, decoded:", payload);
    return NextResponse.next();
  } catch (error) {
    console.log("Middleware - Token invalid:", error);
    // Token is invalid, redirect to auth
    return NextResponse.redirect(new URL("/auth", req.url));
  }
}

export const config = {
  matcher: ["/d/:path*"],
};
