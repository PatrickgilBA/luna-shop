// ============================================================================
//  KONTROLL AV FORMULÄR (validering)
// ============================================================================
//  Samma regler används på två ställen:
//    • i webbläsaren, så att Luna ser felen direkt medan hon skriver
//    • på servern, eftersom allt som kommer från webbläsaren går att fuska med
//
//  Varje funktion svarar { values, errors }:
//    values – de städade värdena (t.ex. utan mellanslag i början och slutet)
//    errors – null om allt är rätt, annars { fältnamn: "felmeddelande" }
// ============================================================================

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value) => (typeof value === "string" ? value.trim() : "");

export function validateLogin(input = {}) {
  const values = {
    email: text(input.email).toLowerCase(),
    password: typeof input.password === "string" ? input.password : "",
  };
  const errors = {};

  if (!values.email) errors.email = "Please enter your email.";
  else if (!EMAIL.test(values.email) || values.email.length > 254) errors.email = "This doesn't look like an email address.";

  if (!values.password) errors.password = "Please enter your password.";
  else if (values.password.length > 200) errors.password = "The password is too long.";

  return { values, errors: Object.keys(errors).length ? errors : null };
}
