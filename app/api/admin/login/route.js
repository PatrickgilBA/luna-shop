// ============================================================================
//  SIGN IN  (address: /api/admin/login)
// ============================================================================
//  The sign-in form (app/admin/login/LoginForm.js) sends the email and
//  password here. We:
//    1. Check that the email and password look reasonable (the same rules as
//       the form, but the browser can't be trusted).
//    2. Ask Supabase to check the password.
//    3. Check that the account is an admin. Otherwise it is signed out at once.
//    4. Save the session in cookies.
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

  // 1. The same check as in the form.
  const { values, errors } = validateLogin(body);
  if (errors) return fail("Please check the form.", 400, errors);

  // 2. Right password? The same answer whether the email or the password was wrong,
  //    so nobody can find out which email addresses have accounts.
  const session = await signInWithPassword(values.email, values.password);
  if (!session) return fail("Wrong email or password.", 401);

  // 3. Is the account an admin?
  if (!(await isAdmin(session.access_token))) {
    await signOut(session.access_token);
    return fail("This account doesn't have access to the admin page.", 403);
  }

  // 4. Save the session.
  saveSession(await cookies(), session);
  return Response.json({ ok: true });
}
