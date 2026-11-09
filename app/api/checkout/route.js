// ============================================================================
//  THE CHECKOUT – runs on the SERVER, not in the customer's browser
// ============================================================================
//  1. Receives the cart (which prints + how many + shipping zone).
//  2. Checks everything against the prints and the stock in Supabase.
//     The prices are looked up HERE, never taken from the browser – otherwise a
//     customer could cheat and change the price.
//  3. Asks Stripe to create a payment page and sends back its address.
//
//  The secret Stripe key is read from the .env.local file (see docs/05).
// ============================================================================

import Stripe from "stripe";
import { SHIPPING_ZONES } from "@/lib/shipping";
import { getProducts } from "@/lib/products";
import { MAX_PER_PRINT } from "@/lib/limits";

// Small helper to reply with an error message.
const fail = (message, status = 400) => Response.json({ error: message }, { status });

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return fail(
      "Payments are not set up yet (missing Stripe key). See docs/05-stripe-payments.md.",
      500
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.");
  }

  const zone = SHIPPING_ZONES[body.zone];
  if (!zone) return fail("Please choose a shipping zone.");

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) return fail("Your cart is empty.");

  // Where the site lives – needed so Stripe can send the customer back.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  // Read the latest prices and stock from Supabase.
  let products;
  try {
    products = await getProducts({ fresh: true });
  } catch (err) {
    console.error(err);
    return fail("Could not check the stock. Please try again.", 500);
  }

  // Build Stripe's list of items, and check every line.
  const lineItems = [];
  for (const item of items) {
    const product = products.find((p) => p.slug === item.slug);
    if (!product) return fail("One of the prints in your cart no longer exists.");
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) return fail("Invalid quantity.");
    if (quantity > MAX_PER_PRINT) {
      return fail(`You can buy at most ${MAX_PER_PRINT} of "${product.title}".`);
    }
    if (product.stock <= 0) return fail(`Sorry, "${product.title}" is sold out.`);
    if (quantity > product.stock) {
      return fail(`Sorry, only ${product.stock} of "${product.title}" left.`);
    }

    lineItems.push({
      quantity,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(product.price * 100), // Stripe counts in cents
        product_data: {
          name: `${product.title} – ${product.size}`,
          // Stripe can only show images that live at a real (https) address.
          ...(siteUrl.startsWith("https://") && {
            images: [new URL(product.images[0], siteUrl).toString()],
          }),
          metadata: { slug: product.slug }, // so the webhook knows which print was bought
        },
      },
    });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: zone.countries },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: `Shipping – ${zone.label}`,
            fixed_amount: { amount: Math.round(zone.price * 100), currency: "eur" },
          },
        },
      ],
      phone_number_collection: { enabled: true }, // the post office often wants a phone number
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
    });
    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return fail("Could not start the checkout. Please try again.", 500);
  }
}
