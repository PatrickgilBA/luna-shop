// ============================================================================
//  LOGGA UT  (adress: /api/admin/logout)
// ============================================================================
//  Loggar ut hos Supabase (så att inloggningen inte kan användas igen)
//  och tar bort cookies.
// ============================================================================

import { cookies } from "next/headers";
import { ACCESS_COOKIE, signOut, clearSession, isSameOrigin } from "@/lib/auth";

export async function POST(request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Not allowed." }, { status: 403 });

  const cookieStore = await cookies();
  await signOut(cookieStore.get(ACCESS_COOKIE)?.value);
  clearSession(cookieStore);
  return Response.json({ ok: true });
}
