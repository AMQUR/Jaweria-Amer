import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { clearAdminSessionCookie, verifyAdminSessionToken } from "@/lib/admin/session";

const PUBLIC_ADMIN_PATHS = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const hasSessionCookie = Boolean(sessionToken);
  const hasValidSession = sessionToken ? verifyAdminSessionToken(sessionToken) : false;

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  if ([...PUBLIC_ADMIN_PATHS].some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    const response = NextResponse.next();
    if (hasSessionCookie && !hasValidSession) {
      clearAdminSessionCookie(response);
    }
    return response;
  }

  if (hasValidSession) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (hasSessionCookie) {
      clearAdminSessionCookie(response);
    }
    return response;
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  const response = NextResponse.redirect(loginUrl);
  if (hasSessionCookie) {
    clearAdminSessionCookie(response);
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
