// ============================================================================
//  INLOGGNING FÖR ADMIN  (adress: /admin/login)
// ============================================================================
//  Själva formuläret ligger i LoginForm.js. Är man redan inloggad som admin
//  skickas man direkt vidare till /admin.
// ============================================================================

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Admin login", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await getAdmin(await cookies())) redirect("/admin");

  return (
    <div className="admin-login">
      <h1>Admin</h1>
      <p className="note">Sign in to manage the prints in the shop.</p>
      <LoginForm />
    </div>
  );
}
