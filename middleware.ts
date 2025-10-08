import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware forces all pages to be dynamic (SSR)
export function middleware(request: NextRequest) {
  // Add a header to force dynamic rendering
  const response = NextResponse.next();
  response.headers.set("x-middleware-cache", "no-cache");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
