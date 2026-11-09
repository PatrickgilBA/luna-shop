// ============================================================================
//  KASSAN – körs på SERVERN, inte i kundens webbläsare
// ============================================================================
//  1. Tar emot varukorgen (vilka posters + hur många + frakt-zon).
//  2. Kontrollerar allt mot data/products.js och lagret i Supabase.
//     Priserna hämtas HÄR, aldrig från webbläsaren – annars skulle en kund
//     kunna fuska och ändra priset.
//  3. Ber Stripe skapa en betalsida och skickar tillbaka adressen dit.
//
//  Den hemliga Stripe-nyckeln läses från filen .env.local (se docs/05).
// ============================================================================

import Stripe from "stripe";
import { getProduct } from "@/data/products";
import { SHIPPING_ZONES } from "@/lib/shipping";
import { getStock, withStock } from "@/lib/inventory";
import { MAX_PER_PRINT } from "@/lib/limits";

// Liten hjälpare för att svara med ett felmeddelande.
const fail = (message, status = 400) => Response.json({ error: message }, { status });

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return fail(
      "Payments are not set up yet (missing Stripe key). See docs/05-stripe-betalning.md.",
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

  // Var hemsidan ligger – behövs för att Stripe ska kunna skicka tillbaka kunden.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  // Hämta det senaste lagret från Supabase.
  let stock;
  try {
    stock = await getStock({ fresh: true });
  } catch (err) {
    console.error(err);
    return fail("Could not check the stock. Please try again.", 500);
  }

  // Bygg Stripes lista över varor, och kontrollera varje rad.
  const lineItems = [];
  for (const item of items) {
    const found = getProduct(item.slug);
    if (!found) return fail("One of the prints in your cart no longer exists.");
    const product = withStock(found, stock);
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
        unit_amount: Math.round(product.price * 100), // Stripe räknar i cent
        product_data: {
          name: `${product.title} – ${product.size}`,
          // Stripe kan bara visa bilder som ligger på en riktig (https) adress.
          ...(siteUrl.startsWith("https://") && {
            images: [new URL(product.images[0], siteUrl).toString()],
          }),
          metadata: { slug: product.slug }, // så att webhooken vet vilken poster som köptes
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
      phone_number_collection: { enabled: true }, // Posten vill ofta ha telefonnummer
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
    });
    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return fail("Could not start the checkout. Please try again.", 500);
  }
}
