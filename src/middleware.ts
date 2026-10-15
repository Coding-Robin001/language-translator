import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// 1. Define routes you want to protect
const protectedRoutes = ["/translations"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if current path starts with any protected route prefix
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Fast cookie check (runs on the Edge runtime without heavy DB hits)
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      // Redirect unauthenticated users to login (preserving target URL in query params)
      const url = new URL("/auth", request.url);
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// 2. Configure matcher (same standard Next.js matcher from your Clerk setup)
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};