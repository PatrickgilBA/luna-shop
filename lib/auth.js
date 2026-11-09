// ============================================================================
//  ADMIN SIGN-IN – Supabase Auth
// ============================================================================
//  Luna signs in at /admin/login with an email and password. Supabase checks
//  the password and replies with two tokens:
//    • access token  – proves who you are, valid for about an hour
//    • refresh token – used to get a new access token when it has expired
//  Both are stored in cookies that the browser's JavaScript can't read (httpOnly).
//
//  Being signed in isn't enough: the account must also be in the "admins" table
//  in Supabase. The database itself checks this (is_admin) on every visit.
//
//  This file only runs on the server. See docs/08-supabase.md.
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE_KEY = () => process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const ACCESS_COOKIE = "luna-admin-access";
export const REFRESH_COOKIE = "luna-admin-refresh";

// Cookie settings: invisible to JavaScript, only sent over https on the
// live site, and not sent along when other sites post forms here.
export function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

// Save a new session in cookies. The access cookie expires a minute before
// the token does, so proxy.js has time to fetch a new one.
export function saveSession(cookies, session) {
  cookies.set(ACCESS_COOKIE, session.access_token, cookieOptions(Math.max(session.expires_in - 60, 60)));
  cookies.set(REFRESH_COOKIE, session.refresh_token, cookieOptions(60 * 60 * 24 * 30)); // 30 days
}

export function clearSession(cookies) {
  cookies.set(ACCESS_COOKIE, "", cookieOptions(0));
  cookies.set(REFRESH_COOKIE, "", cookieOptions(0));
}

// Call Supabase Auth. Returns { ok, status, data }.
async function auth(path, { method = "POST", body, token } = {}) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method,
    headers: {
      apikey: PUBLISHABLE_KEY(),
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

// Sign in with email and password. Returns the session, or null if they were wrong.
export async function signInWithPassword(email, password) {
  const { ok, data } = await auth("token?grant_type=password", { body: { email, password } });
  return ok ? data : null;
}

// Trade a refresh token for a new session. Returns null if it is invalid.
export async function refreshSession(refreshToken) {
  const { ok, data } = await auth("token?grant_type=refresh_token", {
    body: { refresh_token: refreshToken },
  });
  return ok ? data : null;
}

// Sign out at Supabase, so the refresh token stops working.
export async function signOut(accessToken) {
  if (accessToken) await auth("logout", { token: accessToken }).catch(() => {});
}

// Who is signed in? Returns { id, email } or null.
export async function getUser(accessToken) {
  if (!accessToken) return null;
  const { ok, data } = await auth("user", { method: "GET", token: accessToken });
  return ok && data?.id ? { id: data.id, email: data.email } : null;
}

// Is the account in the "admins" table? The database answers itself (the is_admin function).
export async function isAdmin(accessToken) {
  if (!accessToken) return false;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: {
      apikey: PUBLISHABLE_KEY(),
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  return response.ok && (await response.json()) === true;
}

// The signed-in admin for this request, or null. Used by the admin pages.
// cookieStore is the result of `await cookies()` from next/headers.
export async function getAdmin(cookieStore) {
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const [user, admin] = await Promise.all([getUser(accessToken), isAdmin(accessToken)]);
  return user && admin ? { ...user, accessToken } : null;
}

// Does the request come from our own site? Protects against another website
// sending forms to the admin routes in a signed-in visitor's name.
export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
