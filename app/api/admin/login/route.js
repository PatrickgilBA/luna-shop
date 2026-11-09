// ============================================================================
//  LOGGA IN  (adress: /api/admin/login)
// ============================================================================
//  Inloggningsformuläret (app/admin/login/LoginForm.js) skickar mejl och
//  lösenord hit. Vi:
//    1. Kontrollerar att mejl och lösenord ser rimliga ut (samma regler som
//       formuläret, men webbläsaren går inte att lita på).
//    2. Ber Supabase kontrollera lösenordet.
//    3. Kontrollerar att kontot är admin. Annars loggas det ut direkt.
//    4. Sparar inloggningen i cookies.
// ============================================================================

import { cookies } from "next/headers";
import { signInWithPassword, isAdmin, signOut, saveSession, isSameOrigin } from "@/lib/auth";
import { validateLogin } from "@/lib/validation";

const fail = (message, status = 400, fields) => Response.json({ error: message, fields }, { status });

export async function POST(request) {
  if (!isSameOrigin(request)) return fail("Not allowed.", 403);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.");
  }

  // 1. Samma kontroll som i formuläret.
  const { values, errors } = validateLogin(body);
  if (errors) return fail("Please check the form.", 400, errors);

  // 2. Rätt lösenord? Samma svar oavsett om mejlen eller lösenordet var fel,
  //    så att ingen kan ta reda på vilka mejladresser som har konton.
  const session = await signInWithPassword(values.email, values.password);
  if (!session) return fail("Wrong email or password.", 401);

  // 3. Är kontot admin?
  if (!(await isAdmin(session.access_token))) {
    await signOut(session.access_token);
    return fail("This account doesn't have access to the admin page.", 403);
  }

  // 4. Spara inloggningen.
  saveSession(await cookies(), session);
  return Response.json({ ok: true });
}
