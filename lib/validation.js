// ============================================================================
//  FORM VALIDATION
// ============================================================================
//  The same rules are used in two places:
//    • in the browser, so Luna sees mistakes right away while typing
//    • on the server, because anything coming from the browser can be tampered with
//
//  Each function returns { values, errors }:
//    values – the cleaned-up values (e.g. without spaces at the start and end)
//    errors – null if everything is right, otherwise { fieldName: "error message" }
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

// ---- Prints (admin page) ----------------------------------------------------

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// A number from a form field. Accepts both "30.50" and "30,50".
function number(value) {
  if (typeof value === "number") return value;
  const cleaned = text(value).replace(",", ".");
  return cleaned === "" ? NaN : Number(cleaned);
}

// Images are written one per line in the form, or sent as a list.
function imageList(value) {
  const lines = Array.isArray(value) ? value : String(value ?? "").split("\n");
  return lines.map(text).filter(Boolean);
}

// Where uploaded images end up (Supabase Storage, see supabase/04-storage.sql).
export function uploadedImagePrefix() {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/`;
}

// An image may live on the site itself (/images/…) or be uploaded to our
// bucket. Other addresses aren't allowed: Next.js can't show them, and the
// shop would break.
function isAllowedImage(src) {
  return (src.startsWith("/images/") && !src.includes("..")) || src.startsWith(uploadedImagePrefix());
}

// isNew: true when a new print is created. Then a slug is required; an existing
// print's slug can't be changed (it is in links and carts).
export function validateProduct(input = {}, { isNew = false } = {}) {
  const values = {
    title: text(input.title),
    size: text(input.size),
    price: number(input.price),
    description: text(input.description),
    images: imageList(input.images),
    stock: number(input.stock),
    sort_order: text(String(input.sort_order ?? "")) === "" ? 0 : number(input.sort_order), // empty = 0
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
  // Compare with a small margin: computers turn e.g. 0.29 × 100 into 28.999999…
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
