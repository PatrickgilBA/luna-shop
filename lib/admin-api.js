// Gemensamt för adminens produkt-adresser: kontrollera att förfrågan kommer
// från vår sida och från en inloggad admin, och läs formulärets innehåll.

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { getAdmin, isSameOrigin } from "@/lib/auth";
import { PRODUCTS_TAG } from "@/lib/products";

export const fail = (message, status = 400, fields) => Response.json({ error: message, fields }, { status });

// Svarar { admin } eller { response } med ett fel att skicka tillbaka.
export async function requireAdmin(request) {
  if (!isSameOrigin(request)) return { response: fail("Not allowed.", 403) };
  const admin = await getAdmin(await cookies());
  if (!admin) return { response: fail("Please sign in again.", 401) };
  return { admin };
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// Butiken och produktsidorna visar ändringen för nästa besökare, direkt.
export function refreshShop() {
  revalidateTag(PRODUCTS_TAG, { expire: 0 });
}
