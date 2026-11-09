// ============================================================================
//  PRODUKTERNA – hämtas från databasen Supabase
// ============================================================================
//  Alla posters (namn, pris, storlek, beskrivning, bilder och lager) ligger i
//  tabellen "products" i Supabase. Där kan Luna ändra dem, och där räknas
//  lagret ner automatiskt när någon köper (lib/orders.js).
//
//  Den här filen används bara på servern. Nycklarna läses från .env.local.
//  Läs docs/08-supabase.md för hur allt hänger ihop.
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Namnet som sidorna "märker" produkterna med, så att de kan uppdateras direkt efter en ändring.
export const PRODUCTS_TAG = "products";

// Kolumnerna som sidan behöver. Ordningen i butiken styrs av sort_order.
const COLUMNS = "slug,title,size,price,description,images,stock";

// Hämta från Supabase med den publika nyckeln (som bara får läsa).
//
// Vanligtvis sparas svaret i högst 60 sekunder, så att sidan är snabb och
// ändringar som Luna gör i Supabase syns inom en minut.
// fresh: true hämtar alltid det senaste (används av kassan).
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

// Alla posters, i den ordning de visas i butiken.
export function getProducts(options) {
  return read("order=sort_order.asc,title.asc", options);
}

// En poster, eller null om den inte finns.
export async function getProduct(slug, options) {
  const rows = await read(`slug=eq.${encodeURIComponent(slug)}`, options);
  return rows[0] ?? null;
}

// Räkna ner lagret efter ett köp. Körs bara av servern (lib/orders.js).
// items ser ut så här: [{ slug: "catsuit", quantity: 2 }, ...]
// Svarar false om köpet redan var räknat (Stripe skickar ibland samma köp två gånger).
export async function processOrder(sessionId, items) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/process_order`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SECRET_KEY, // hemlig nyckel – bara på servern!
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
