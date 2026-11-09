// ============================================================================
//  PROXY – runs before every request to the admin pages
// ============================================================================
//  The session (access token) lasts about an hour. When it has expired, the
//  proxy fetches a new one with the refresh token, so Luna stays signed in
//  for up to 30 days without typing the password again.
//
//  The proxy does NOT decide who gets in. The admin pages do that themselves,
//  by asking the database whether the account is an admin (lib/auth.js).
// ============================================================================

import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, refreshSession, saveSession, clearSession } from "@/lib/auth";

export async function proxy(request) {
  const hasAccess = request.cookies.has(ACCESS_COOKIE);
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  // Signed in and valid, or not signed in at all: nothing to do.
  if (hasAccess || !refreshToken) return NextResponse.next();

  const session = await refreshSession(refreshToken);

  if (!session) {
    // The refresh token no longer works (signed out or too old): clear it.
    const response = NextResponse.next();
    clearSession(response.cookies);
    return response;
  }

  // Give the page the new cookies right away, and save them in the browser.
  request.cookies.set(ACCESS_COOKIE, session.access_token);
  request.cookies.set(REFRESH_COOKIE, session.refresh_token);
  const response = NextResponse.next({ request });
  saveSession(response.cookies, session);
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
