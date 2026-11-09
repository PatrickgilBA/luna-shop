// ============================================================================
//  THE PRINTS – read from the Supabase database
// ============================================================================
//  Every print (name, price, size, description, images and stock) lives in
//  the "products" table in Supabase. Luna can change them there, and the
//  stock goes down there automatically when someone buys (lib/orders.js).
//
//  This file only runs on the server. The keys are read from .env.local.
//  See docs/08-supabase.md for how it all fits together.
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// The tag the pages put on the product data, so they can be refreshed right after a change.
export const PRODUCTS_TAG = "products";

// The columns the site needs. The order in the shop comes from sort_order.
const COLUMNS = "slug,title,size,price,description,images,stock,sort_order";

// Read from Supabase with the publishable key (which may only read).
//
// Normally the answer is cached for at most 60 seconds, so the site is fast and
// changes Luna makes in Supabase show within a minute.
// fresh: true always reads the latest data (used by the checkout).
async function read(query, { fresh = false } = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=${COLUMNS}&${query}`, {
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
    ...(fresh ? { cache: "no-store" } : { next: { revalidate: 60, tags: [PRODUCTS_TAG] } }),
  });
  if (!response.ok) {
    throw new Error(`Could not read the products from Supabase (${response.status}).`);
  }
  const rows = await response.json();
  return rows.map((row) => ({ ...row, price: Number(row.price) }));
}

// Every print, in the order they are shown in the shop.
export function getProducts(options) {
  return read("order=sort_order.asc,title.asc", options);
}

// One print, or null if it doesn't exist.
export async function getProduct(slug, options) {
  const rows = await read(`slug=eq.${encodeURIComponent(slug)}`, options);
  return rows[0] ?? null;
}

// Lower the stock after a purchase. Only run by the server (lib/orders.js).
// items looks like this: [{ slug: "catsuit", quantity: 2 }, ...]
// Returns false if the order was already counted (Stripe sometimes sends the same order twice).
export async function processOrder(sessionId, items) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/process_order`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SECRET_KEY, // secret key – server only!
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session_id: sessionId, items }),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Supabase could not update the stock (${response.status}): ${await response.text()}`);
  }
  return response.json();
}

// ---- Changing prints (admins only) -------------------------------------------
// These calls use the signed-in admin's own access token. So it is the
// database itself (Row Level Security, is_admin) that makes sure only admins may
// create, change and delete – not just this code.
//
// Returns { ok, product, duplicate, notFound }.

async function write(method, query, accessToken, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products${query}`, {
    method,
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation", // reply with the row that was changed
    },
    ...(body && { body: JSON.stringify(body) }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);

  if (response.status === 409 && data?.code === "23505") return { ok: false, duplicate: true };
  if (!response.ok) {
    throw new Error(`Supabase refused the change (${response.status}): ${data?.message ?? ""}`);
  }
  // An empty list means no row was changed: the print doesn't exist, or the
  // account wasn't an admin.
  const row = Array.isArray(data) ? data[0] : null;
  return row ? { ok: true, product: { ...row, price: Number(row.price) } } : { ok: false, notFound: true };
}

const bySlug = (slug) => `?slug=eq.${encodeURIComponent(slug)}`;

export function createProduct(accessToken, values) {
  return write("POST", "", accessToken, values);
}

export function updateProduct(accessToken, slug, values) {
  const { slug: _ignored, ...changes } = values; // a print's slug never changes
  return write("PATCH", bySlug(slug), accessToken, { ...changes, updated_at: new Date().toISOString() });
}

export function deleteProduct(accessToken, slug) {
  return write("DELETE", bySlug(slug), accessToken);
}
