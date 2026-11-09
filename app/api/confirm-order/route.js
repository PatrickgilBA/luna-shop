// ============================================================================
//  BEKRÄFTA KÖP FRÅN TACK-SIDAN  (adress: /api/confirm-order)
// ============================================================================
//  När kunden har betalat skickar Stripe hen till /success?session_id=...
//  Tack-sidan skickar då köpets id hit, och vi:
//    1. Frågar Stripe om köpet verkligen är betalt (vi litar inte på webbläsaren).
//    2. Räknar ner lagret i Supabase (lib/orders.js).
//
//  Det gör att lagret räknas ner även när webhooken inte är inkopplad,
//  till exempel när man testar på sin egen dator.
// ============================================================================

import Stripe from "stripe";
import { countPaidOrder } from "@/lib/orders";

const fail = (message, status = 400) => Response.json({ error: message }, { status });

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY) return fail("Stripe is not set up.", 500);

  let sessionId;
  try {
    ({ sessionId } = await request.json());
  } catch {
    return fail("Invalid request.");
  }
  if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
    return fail("Invalid order id.");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // 1. Är köpet betalt? Svaret kommer direkt från Stripe.
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return fail("Order not found.", 404);
  }
  if (session.payment_status !== "paid") return fail("The order is not paid.");

  // 2. Räkna ner lagret. Har det redan gjorts händer inget.
  try {
    const counted = await countPaidOrder(stripe, sessionId);
    return Response.json({ ok: true, counted });
  } catch (err) {
    console.error("Could not update the inventory.", err);
    return fail("Could not update the inventory.", 500);
  }
}
