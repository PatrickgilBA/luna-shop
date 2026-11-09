// A form field: label, the input itself, an optional hint and
// an error message. aria-invalid and aria-describedby make screen readers
// read out the hint and the error.

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
