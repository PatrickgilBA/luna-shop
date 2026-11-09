"use client";
// The sign-in form. Checks the fields right away in the browser
// (lib/validation.js), sends them to /api/admin/login with fetch and
// shows the answer without reloading the page.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateLogin } from "@/lib/validation";
import FormField from "@/components/FormField";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({}); // errors under each field
  const [message, setMessage] = useState(""); // error for the whole form
  const [sending, setSending] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    // Remove the error under the field as soon as you start fixing it.
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    // 1. Check in the browser first.
    const { errors: found } = validateLogin(form);
    if (found) return setErrors(found);

    // 2. Send to the server.
    setSending(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.fields || {});
        setMessage(data.error || "Something went wrong.");
        setSending(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setMessage("Could not reach the server. Please try again.");
      setSending(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <FormField label="Email" id="email" error={errors.email}>
        <input
          type="email"
          autoComplete="username"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </FormField>

      <FormField label="Password" id="password" error={errors.password}>
        <input
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />
      </FormField>

      {message && (
        <p className="error" role="alert">
          {message}
        </p>
      )}

      <button className="button button--big" type="submit" disabled={sending}>
        {sending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
