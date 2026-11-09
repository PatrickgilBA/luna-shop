"use client";
// The "Sign out" button on the admin page.

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button className="button button--light" onClick={handleClick} disabled={busy}>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
