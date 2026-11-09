// ============================================================================
//  LAGRET – hämtas från databasen Supabase
// ============================================================================
//  Hur många av varje poster som finns kvar ligger INTE i data/products.js,
//  utan i tabellen "inventory" i Supabase. Där kan Luna ändra siffrorna, och
//  där räknas de ner automatiskt när någon köper (app/api/stripe-webhook).
//
//  Den här filen används bara på servern. Nycklarna läses från .env.local.
//  Läs docs/08-supabase-stock.md för hur allt hänger ihop.
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Namnet som sidorna "märker" lagret med, så att de kan uppdateras direkt efter ett köp.
export const INVENTORY_TAG = "inventory";

// Hämta lagret för alla posters, t.ex. { catsuit: 10, tiger: 3 }.
//
// Vanligtvis sparas svaret i högst 60 sekunder, så att sidan är snabb och
// ändringar som Luna gör i Supabase syns inom en minut.
// fresh: true hämtar alltid den senaste siffran (används av kassan).
export async function getStock({ fresh = false } = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/inventory?select=slug,stock`, {
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
    ...(fresh ? { cache: "no-store" } : { next: { revalidate: 60, tags: [INVENTORY_TAG] } }),
  });
  if (!response.ok) {
    throw new Error(`Could not read the inventory from Supabase (${response.status}).`);
  }
  const rows = await response.json();
  return Object.fromEntries(rows.map((row) => [row.slug, row.stock]));
}

// Lägg till lagret på en poster. En poster som saknas i Supabase räknas som slutsåld.
export function withStock(product, stock) {
  return { ...product, stock: stock[product.slug] ?? 0 };
}

// Räkna ner lagret efter ett köp. Körs bara av Stripe-webhooken.
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
    throw new Error(`Supabase could not update the inventory (${response.status}): ${await response.text()}`);
  }
  return response.json();
}
