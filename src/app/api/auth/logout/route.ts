import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";

/**
 * POST /api/auth/logout
 * Logs out the current user by clearing the authentication cookie
 * @returns NextResponse with success message
 */
export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  // Clear the token cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
    ...(env.NODE_ENV === "production" && env.COOKIE_DOMAIN
      ? { domain: env.COOKIE_DOMAIN }
      : {}),
  });

  return response;
}

