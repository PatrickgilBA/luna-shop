// ============================================================================
//  RÄKNA NER LAGRET EFTER ETT BETALT KÖP
// ============================================================================
//  Används på två ställen, så att lagret alltid räknas ner:
//    • app/api/stripe-webhook – Stripe meddelar oss själv att köpet är betalt
//    • app/api/confirm-order  – tack-sidan ber oss kolla köpet när kunden
//                               kommer tillbaka från Stripe
//  Kommer båda räknas köpet ändå bara EN gång (process_order i Supabase
//  kommer ihåg vilka köp som redan räknats).
// ============================================================================

import { revalidateTag } from "next/cache";
import { processOrder, PRODUCTS_TAG } from "@/lib/products";

// Räkna ner lagret för ett köp som Stripe har bekräftat är betalt.
export async function countPaidOrder(stripe, sessionId) {
  // Vilka posters köptes? Slug:en sparades på varje vara av kassan (app/api/checkout).
  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 100,
    expand: ["data.price.product"],
  });
  const items = lineItems.data
    .map((line) => ({ slug: line.price?.product?.metadata?.slug, quantity: line.quantity }))
    .filter((item) => item.slug);

  const counted = await processOrder(sessionId, items);

  // Sidorna visar det nya lagret för nästa besökare, direkt.
  if (counted) revalidateTag(PRODUCTS_TAG, { expire: 0 });

  console.log(`Order ${sessionId} ${counted ? "counted" : "already counted"}.`, items);
  return counted;
}
