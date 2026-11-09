"use client";
// Inloggningsformuläret. Kontrollerar fälten direkt i webbläsaren
// (lib/validation.js), skickar dem till /api/admin/login med fetch och
// visar svaret utan att sidan laddas om.

import { cloneElement, useState } from "react";
import { useRouter } from "next/navigation";
import { validateLogin } from "@/lib/validation";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({}); // fel under varje fält
  const [message, setMessage] = useState(""); // fel för hela formuläret
  const [sending, setSending] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    // Ta bort felet under fältet när man börjar rätta det.
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    // 1. Kontrollera i webbläsaren först.
    const { errors: found } = validateLogin(form);
    if (found) return setErrors(found);

    // 2. Skicka till servern.
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
      <Field label="Email" error={errors.email} id="email">
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </Field>

      <Field label="Password" error={errors.password} id="password">
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />
      </Field>

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

// Ett fält med etikett och felmeddelande. aria-invalid och aria-describedby
// gör att skärmläsare läser upp felet.
function Field({ label, error, id, children }) {
  const errorId = `${id}-error`;
  return (
    <div className={error ? "field field--error" : "field"}>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, {
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
