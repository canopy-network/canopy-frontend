import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route configuration for query parameter filtering
 * Maps routes to their allowed query parameters
 */
const ALLOWED_QUERY_PARAMS: Record<string, string[]> = {
  "/": ["filter", "sort_by", "view_type"],
  "/chains/[id]": ["range", "tab"],
  "/chains/[id]": ["success", "name"],
};

/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES = ["/settings", "/launchpad"];

/**
 * Protected route patterns (for dynamic routes)
 */
const PROTECTED_ROUTE_PATTERNS = [
  /^\/chains\/[^/]+\/edit$/,
  /^\/launchpad\/.+/, // Protect all launchpad sub-routes
];

/**
 * Check if user is authenticated by checking for auth cookie
 */
function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get("canopy_auth");
  const isAuth = authCookie?.value === "true";

  // Log authentication status for debugging
  console.log("[Middleware] Auth check:", {
    pathname: request.nextUrl.pathname,
    hasAuthCookie: !!authCookie,
    authValue: authCookie?.value,
    isAuthenticated: isAuth,
  });

  return isAuth;
}

/**
 * Check if a route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  // Check exact matches
  if (PROTECTED_ROUTES.includes(pathname)) {
    return true;
  }

  // Check pattern matches
  return PROTECTED_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

/**
 * Get allowed query params for a given pathname
 */
function getAllowedQueryParams(pathname: string): string[] | null {
  // Exact match
  if (ALLOWED_QUERY_PARAMS[pathname]) {
    return ALLOWED_QUERY_PARAMS[pathname];
  }

  // Check for dynamic route patterns

  // Match /chains/[any-id] pattern
  if (/^\/chains\/[^/]+$/.test(pathname)) {
    return ALLOWED_QUERY_PARAMS["/chains/[id]"] || null;
  }

  // No filtering needed for this route
  return null;
}

/**
 * Filter query parameters to only include allowed ones
 */
function filterQueryParams(
  searchParams: URLSearchParams,
  allowedParams: string[] | null | undefined
): URLSearchParams {
  const filtered = new URLSearchParams();

  if (!allowedParams || !Array.isArray(allowedParams)) {
    return filtered;
  }

  for (const param of allowedParams) {
    const value = searchParams.get(param);
    if (value !== null) {
      filtered.set(param, value);
    }
  }

  return filtered;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Normalize pathname for checks (remove trailing slash for consistency)
  const normalizedPathname =
    pathname === "/" ? pathname : pathname.replace(/\/$/, "");

  // Check if route is protected
  const isProtected = isProtectedRoute(normalizedPathname);

  if (isProtected) {
    console.log("[Middleware] Protected route detected:", pathname);

    const authenticated = isAuthenticated(request);

    if (!authenticated) {
      console.log("[Middleware] Redirecting unauthenticated user to home");
      // Redirect to home if not authenticated
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }

    console.log("[Middleware] User authenticated, allowing access");
  }

  // Check if query params need filtering
  const allowedParams = getAllowedQueryParams(normalizedPathname);

  if (allowedParams !== null) {
    // Get current query params
    const currentParams = new URLSearchParams(searchParams.toString());
    const filteredParams = filterQueryParams(currentParams, allowedParams);

    // Check if any params were removed
    const hasUnwantedParams =
      currentParams.toString() !== filteredParams.toString();

    if (hasUnwantedParams) {
      // Redirect to the same page with filtered params
      const newUrl = new URL(pathname, request.url);
      newUrl.search = filteredParams.toString();
      return NextResponse.redirect(newUrl);
    }
  }

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
