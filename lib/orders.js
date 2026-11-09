// ============================================================================
//  LOWER THE STOCK AFTER A PAID ORDER
// ============================================================================
//  Used in two places, so the stock always goes down:
//    • app/api/stripe-webhook – Stripe tells us itself that the order is paid
//    • app/api/confirm-order  – the thank-you page asks us to check the order when
//                               the customer comes back from Stripe
//  If both happen, the order is still only counted ONCE (process_order in
//  Supabase remembers which orders have already been counted).
// ============================================================================

import { revalidateTag } from "next/cache";
import { processOrder, PRODUCTS_TAG } from "@/lib/products";

// Lower the stock for an order that Stripe has confirmed is paid.
export async function countPaidOrder(stripe, sessionId) {
  // Which prints were bought? The checkout stored the slug on each item (app/api/checkout).
  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 100,
    expand: ["data.price.product"],
  });
  const items = lineItems.data
    .map((line) => ({ slug: line.price?.product?.metadata?.slug, quantity: line.quantity }))
    .filter((item) => item.slug);

  const counted = await processOrder(sessionId, items);

  // The pages show the new stock to the next visitor, right away.
  if (counted) revalidateTag(PRODUCTS_TAG, { expire: 0 });

  console.log(`Order ${sessionId} ${counted ? "counted" : "already counted"}.`, items);
  return counted;
}
