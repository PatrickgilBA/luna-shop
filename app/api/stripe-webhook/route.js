// ============================================================================
//  STRIPE WEBHOOK – lowers the stock after a purchase  (address: /api/stripe-webhook)
// ============================================================================
//  When a customer has paid, Stripe sends a message here
//  ("checkout.session.completed"). Then:
//    1. We check that the message really comes from Stripe
//       (with STRIPE_WEBHOOK_SECRET from .env.local).
//    2. We lower the stock in Supabase (lib/orders.js).
//
//  The thank-you page does the same through app/api/confirm-order. The order
//  is still only counted once.
//
//  See docs/08-supabase.md for how to connect the webhook in Stripe.
// ============================================================================

import Stripe from "stripe";
import { countPaidOrder } from "@/lib/orders";

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook: STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is missing.");
    return new Response("Webhook not configured", { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // 1. Is it really Stripe sending this? Otherwise anyone could lower the stock.
  let event;
  try {
    const body = await request.text(); // must be read as raw text for the check to work
    const signature = request.headers.get("stripe-signature");
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook: invalid signature.", err.message);
    return new Response("Invalid signature", { status: 400 });
  }

  // We only care about paid orders. Everything else just gets an "OK".
  const isPaid =
    (event.type === "checkout.session.completed" && event.data.object.payment_status === "paid") ||
    event.type === "checkout.session.async_payment_succeeded";
  if (!isPaid) return new Response("Ignored", { status: 200 });

  const session = event.data.object;

  try {
    // 2. Lower the stock. The same order is never counted twice.
    await countPaidOrder(stripe, session.id);
    return new Response("OK", { status: 200 });
  } catch (err) {
    // If we reply with an error, Stripe tries again later – useful if Supabase was down for a moment.
    console.error("Stripe webhook: could not update the inventory.", err);
    return new Response("Could not update inventory", { status: 500 });
  }
}
