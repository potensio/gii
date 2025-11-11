import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "Logged out successfully",
    },
    { status: 200 }
  );

  // Clear both token cookies (in case there are multiple)
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0, // Expire immediately
    path: "/",
  };

  response.cookies.set("token", "", cookieOptions);
  response.cookies.set("auth-token", "", cookieOptions);

  return response;
}
