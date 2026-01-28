import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "./lib/auth/jwt-edge";

// Helper to get token from request (Edge compatible)
function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

// Routes that require authentication
const protectedRoutes = ["/user", "/admin", "/employer"];

// Routes that should redirect if already authenticated
const authRoutes = ["/auth/login", "/auth/register", "/signin", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie or Authorization header
  const token =
    request.cookies.get("token")?.value ||
    getTokenFromRequest(request);

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing protected route with token, verify it
  if (isProtectedRoute && token) {
    try {
      const payload = await verifyTokenEdge(token);
      
      // Check admin routes require admin role
      if (pathname.startsWith("/admin") && payload.role !== "admin") {
        // Redirect to appropriate dashboard based on role
        if (payload.role === "employer") {
          return NextResponse.redirect(new URL("/employer", request.url));
        }
        return NextResponse.redirect(new URL("/user", request.url));
      }

      // Check employer routes require employer role
      if (pathname.startsWith("/employer") && payload.role !== "employer") {
        // Redirect to appropriate dashboard based on role
        if (payload.role === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.redirect(new URL("/user", request.url));
      }

      // Check user routes - allow admins to access user routes too
      if (pathname.startsWith("/user")) {
        if (payload.role === "admin" || payload.role === "employer") {
          // Allow admins and employers to access user routes
          return NextResponse.next();
        }
      }
      
      // Token is valid, allow access
      return NextResponse.next();
    } catch (_error) {
      // Invalid token, redirect to login and clear cookie
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      return response;
    }
  }

  // If accessing auth route with valid token, redirect to dashboard
  if (isAuthRoute && token) {
    try {
      const payload = await verifyTokenEdge(token);
      if (payload.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else if (payload.role === "employer") {
        return NextResponse.redirect(new URL("/employer", request.url));
      } else {
        return NextResponse.redirect(new URL("/user", request.url));
      }
    } catch (_error) {
      // Invalid token, allow access to auth routes
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

