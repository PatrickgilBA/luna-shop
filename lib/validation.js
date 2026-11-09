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

// ---- Produkter (adminsidan) ------------------------------------------------

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Ett tal från ett formulärfält. Tål både "30.50" och "30,50".
function number(value) {
  if (typeof value === "number") return value;
  const cleaned = text(value).replace(",", ".");
  return cleaned === "" ? NaN : Number(cleaned);
}

// Bilderna skrivs en per rad i formuläret, eller skickas som en lista.
function imageList(value) {
  const lines = Array.isArray(value) ? value : String(value ?? "").split("\n");
  return lines.map(text).filter(Boolean);
}

// Var uppladdade bilder hamnar (Supabase Storage, se supabase/04-storage.sql).
export function uploadedImagePrefix() {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/`;
}

// En bild får ligga på sidan själv (/images/…) eller vara uppladdad till vår
// bildmapp. Andra adresser tillåts inte: Next.js kan inte visa dem, och då
// skulle butiken gå sönder.
function isAllowedImage(src) {
  return (src.startsWith("/images/") && !src.includes("..")) || src.startsWith(uploadedImagePrefix());
}

// isNew: true när en ny poster skapas. Då måste slug fyllas i; en befintlig
// posters slug går inte att ändra (den finns i länkar och varukorgar).
export function validateProduct(input = {}, { isNew = false } = {}) {
  const values = {
    title: text(input.title),
    size: text(input.size),
    price: number(input.price),
    description: text(input.description),
    images: imageList(input.images),
    stock: number(input.stock),
    sort_order: text(String(input.sort_order ?? "")) === "" ? 0 : number(input.sort_order), // tomt = 0
  };
  if (isNew) values.slug = text(input.slug).toLowerCase();
  const errors = {};

  if (isNew) {
    if (!values.slug) errors.slug = "Please enter a slug, for example blue-cat.";
    else if (!SLUG.test(values.slug)) errors.slug = "Only lowercase letters, numbers and single hyphens, for example blue-cat.";
    else if (values.slug.length > 60) errors.slug = "Keep the slug under 60 characters.";
  }

  if (!values.title) errors.title = "Please enter a name.";
  else if (values.title.length > 100) errors.title = "Keep the name under 100 characters.";

  if (!values.size) errors.size = "Please enter a size, for example A4 (21 × 29.7 cm).";
  else if (values.size.length > 60) errors.size = "Keep the size under 60 characters.";

  if (Number.isNaN(values.price)) errors.price = "Please enter a price in euro, for example 30.";
  else if (values.price <= 0) errors.price = "The price must be more than 0.";
  else if (values.price > 10000) errors.price = "The price can be at most €10,000.";
  // Jämför med en liten marginal: datorer räknar t.ex. 0.29 × 100 till 28.999999…
  else if (Math.abs(values.price * 100 - Math.round(values.price * 100)) > 1e-6) errors.price = "Use at most two decimals, for example 30.50.";

  if (values.description.length > 1000) errors.description = "Keep the description under 1,000 characters.";

  if (values.images.length === 0) errors.images = "Add at least one image.";
  else if (values.images.length > 10) errors.images = "Use at most 10 images.";
  else if (values.images.some((src) => !isAllowedImage(src))) {
    errors.images = "Use images from the site (/images/…) or uploaded with the button.";
  }

  if (Number.isNaN(values.stock)) errors.stock = "Please enter how many are in stock.";
  else if (!Number.isInteger(values.stock) || values.stock < 0) errors.stock = "Stock must be a whole number, 0 or more.";
  else if (values.stock > 10000) errors.stock = "Stock can be at most 10,000.";

  if (!Number.isInteger(values.sort_order)) errors.sort_order = "The order must be a whole number.";

  return { values, errors: Object.keys(errors).length ? errors : null };
}
