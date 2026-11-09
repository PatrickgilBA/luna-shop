// Ett fält i ett formulär: etikett, själva fältet, en valfri hjälptext och
// ett felmeddelande. aria-invalid och aria-describedby gör att skärmläsare
// läser upp hjälptexten och felet.

import { cloneElement } from "react";

export default function FormField({ label, id, error, hint, children }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={error ? "field field--error" : "field"}>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
