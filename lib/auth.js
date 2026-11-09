// ============================================================================
//  INLOGGNING FÖR ADMIN – Supabase Auth
// ============================================================================
//  Luna loggar in på /admin/login med mejl och lösenord. Supabase kontrollerar
//  lösenordet och svarar med två "nycklar" (tokens):
//    • access token  – bevisar vem man är, gäller i ungefär en timme
//    • refresh token – används för att få en ny access token när den gått ut
//  Båda sparas i cookies som webbläsarens JavaScript inte kan läsa (httpOnly).
//
//  Att vara inloggad räcker inte: kontot måste också stå i tabellen "admins"
//  i Supabase. Det kontrolleras av databasen själv (is_admin) vid varje besök.
//
//  Den här filen används bara på servern. Läs docs/08-supabase.md.
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE_KEY = () => process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const ACCESS_COOKIE = "luna-admin-access";
export const REFRESH_COOKIE = "luna-admin-refresh";

// Inställningar för cookies: osynliga för JavaScript, bara via https på den
// riktiga sidan, och skickas inte med när andra sidor länkar hit med formulär.
export function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

// Spara en ny inloggning i cookies. Access-cookien försvinner en minut innan
// tokenen går ut, så att proxy.js hinner hämta en ny.
export function saveSession(cookies, session) {
  cookies.set(ACCESS_COOKIE, session.access_token, cookieOptions(Math.max(session.expires_in - 60, 60)));
  cookies.set(REFRESH_COOKIE, session.refresh_token, cookieOptions(60 * 60 * 24 * 30)); // 30 dagar
}

export function clearSession(cookies) {
  cookies.set(ACCESS_COOKIE, "", cookieOptions(0));
  cookies.set(REFRESH_COOKIE, "", cookieOptions(0));
}

// Anropa Supabase Auth. Svarar { ok, status, data }.
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

// Logga in med mejl och lösenord. Svarar med inloggningen, eller null om det var fel.
export async function signInWithPassword(email, password) {
  const { ok, data } = await auth("token?grant_type=password", { body: { email, password } });
  return ok ? data : null;
}

// Byt en refresh token mot en ny inloggning. Svarar null om den är ogiltig.
export async function refreshSession(refreshToken) {
  const { ok, data } = await auth("token?grant_type=refresh_token", {
    body: { refresh_token: refreshToken },
  });
  return ok ? data : null;
}

// Logga ut hos Supabase, så att refresh token slutar fungera.
export async function signOut(accessToken) {
  if (accessToken) await auth("logout", { token: accessToken }).catch(() => {});
}

// Vem är inloggad? Svarar { id, email } eller null.
export async function getUser(accessToken) {
  if (!accessToken) return null;
  const { ok, data } = await auth("user", { method: "GET", token: accessToken });
  return ok && data?.id ? { id: data.id, email: data.email } : null;
}

// Står kontot i tabellen "admins"? Databasen svarar själv (funktionen is_admin).
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

// Inloggad admin för den här förfrågan, eller null. Används av adminsidorna.
// cookieStore är resultatet av `await cookies()` från next/headers.
export async function getAdmin(cookieStore) {
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const [user, admin] = await Promise.all([getUser(accessToken), isAdmin(accessToken)]);
  return user && admin ? { ...user, accessToken } : null;
}

// Kommer förfrågan från vår egen sida? Skyddar mot att en annan webbplats
// skickar formulär till adminsidan i en inloggad besökares namn.
export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
