"use client";
// Knappen "Delete this print". Frågar först om man är säker, eftersom det
// inte går att ångra.

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ slug, title }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleDelete() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/products/${slug}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong.");
      router.push(`/admin?deleted=${encodeURIComponent(title)}`);
      router.refresh();
    } catch (err) {
      setMessage(err.message);
      setBusy(false);
    }
  }

  if (!asking) {
    return (
      <button className="button button--danger" onClick={() => setAsking(true)}>
        Delete this print
      </button>
    );
  }

  return (
    <div className="confirm" role="alertdialog" aria-labelledby="confirm-text">
      <p id="confirm-text">
        Delete <strong>{title}</strong> from the shop? This can't be undone.
      </p>
      <div className="form-actions">
        <button className="button button--danger" onClick={handleDelete} disabled={busy} autoFocus>
          {busy ? "Deleting…" : "Yes, delete it"}
        </button>
        <button className="button button--light" onClick={() => setAsking(false)} disabled={busy}>
          Cancel
        </button>
      </div>
      {message && (
        <p className="error" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
