// ============================================================================
//  PROXY – körs före varje förfrågan till adminsidorna
// ============================================================================
//  Inloggningen (access token) gäller ungefär en timme. När den har gått ut
//  hämtar proxyn en ny med hjälp av refresh token, så att Luna förblir
//  inloggad i upp till 30 dagar utan att behöva skriva lösenordet igen.
//
//  Proxyn bestämmer INTE vem som får komma in. Det gör adminsidorna själva,
//  genom att fråga databasen om kontot är admin (lib/auth.js).
// ============================================================================

import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, refreshSession, saveSession, clearSession } from "@/lib/auth";

export async function proxy(request) {
  const hasAccess = request.cookies.has(ACCESS_COOKIE);
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  // Inloggad och giltig, eller inte inloggad alls: inget att göra.
  if (hasAccess || !refreshToken) return NextResponse.next();

  const session = await refreshSession(refreshToken);

  if (!session) {
    // Refresh token fungerar inte längre (utloggad eller för gammal): rensa.
    const response = NextResponse.next();
    clearSession(response.cookies);
    return response;
  }

  // Ge sidan de nya cookies direkt, och spara dem i webbläsaren.
  request.cookies.set(ACCESS_COOKIE, session.access_token);
  request.cookies.set(REFRESH_COOKIE, session.refresh_token);
  const response = NextResponse.next({ request });
  saveSession(response.cookies, session);
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
