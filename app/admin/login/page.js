// ============================================================================
//  ADMIN SIGN-IN  (address: /admin/login)
// ============================================================================
//  The form itself is in LoginForm.js. If you are already signed in as an admin,
//  you are sent straight on to /admin.
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
