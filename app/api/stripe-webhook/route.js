// ============================================================================
//  STRIPE-WEBHOOK – räknar ner lagret efter ett köp  (adress: /api/stripe-webhook)
// ============================================================================
//  När en kund har betalat skickar Stripe ett meddelande hit
//  ("checkout.session.completed"). Då:
//    1. Kontrollerar vi att meddelandet verkligen kommer från Stripe
//       (med STRIPE_WEBHOOK_SECRET från .env.local).
//    2. Räknar ner lagret i Supabase (lib/orders.js).
//
//  Tack-sidan gör samma sak via app/api/confirm-order. Köpet räknas ändå
//  bara en gång.
//
//  Läs docs/08-supabase-lager.md för hur man kopplar in webhooken hos Stripe.
// ============================================================================

import Stripe from "stripe";
import { countPaidOrder } from "@/lib/orders";

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook: STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is missing.");
    return new Response("Webhook not configured", { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // 1. Är det verkligen Stripe som skickar? Annars kunde vem som helst räkna ner lagret.
  let event;
  try {
    const body = await request.text(); // måste läsas som ren text för att kontrollen ska fungera
    const signature = request.headers.get("stripe-signature");
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook: invalid signature.", err.message);
    return new Response("Invalid signature", { status: 400 });
  }

  // Vi bryr oss bara om betalda köp. Allt annat svarar vi bara "OK" på.
  const isPaid =
    (event.type === "checkout.session.completed" && event.data.object.payment_status === "paid") ||
    event.type === "checkout.session.async_payment_succeeded";
  if (!isPaid) return new Response("Ignored", { status: 200 });

  const session = event.data.object;

  try {
    // 2. Räkna ner lagret. Samma köp räknas aldrig två gånger.
    await countPaidOrder(stripe, session.id);
    return new Response("OK", { status: 200 });
  } catch (err) {
    // Svarar vi med ett fel försöker Stripe igen senare – bra om Supabase var nere en stund.
    console.error("Stripe webhook: could not update the inventory.", err);
    return new Response("Could not update inventory", { status: 500 });
  }
}
