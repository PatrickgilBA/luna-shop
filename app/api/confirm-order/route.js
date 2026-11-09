// ============================================================================
//  CONFIRM AN ORDER FROM THE THANK-YOU PAGE  (address: /api/confirm-order)
// ============================================================================
//  When the customer has paid, Stripe sends them to /success?session_id=...
//  The thank-you page then sends the order id here, and we:
//    1. Ask Stripe whether the order really is paid (we don't trust the browser).
//    2. Lower the stock in Supabase (lib/orders.js).
//
//  This lowers the stock even when the webhook isn't connected,
//  for example when testing on your own computer.
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

  // 1. Is the order paid? The answer comes straight from Stripe.
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return fail("Order not found.", 404);
  }
  if (session.payment_status !== "paid") return fail("The order is not paid.");

  // 2. Lower the stock. If that has already been done, nothing happens.
  try {
    const counted = await countPaidOrder(stripe, sessionId);
    return Response.json({ ok: true, counted });
  } catch (err) {
    console.error("Could not update the inventory.", err);
    return fail("Could not update the inventory.", 500);
  }
}
