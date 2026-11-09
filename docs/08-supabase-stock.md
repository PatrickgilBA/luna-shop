# 8. Stock in Supabase

How many of each print are left is stored in the **Supabase** database, not in the code. When someone buys, the stock goes down automatically. At 0 it says "Sold out" and the print can't be bought.

## Changing the stock by hand

1. Sign in at [supabase.com](https://supabase.com/dashboard) and open the project.
2. Click **Table Editor** (the grid icon in the left menu) → the **inventory** table.
3. Double-click the number in the `stock` column, type the new number and press Enter.

The change shows on the site within **one minute**. No publishing needed.

- **Sold out:** set `stock` to `0`.
- **Restocked:** type the new number.

## Adding a new print

A new print needs to be in **two** places:

1. In `data/products.js`, with name, price and images (see [04](04-editing-products.md)).
2. In Supabase: **Table Editor → inventory → Insert → Insert row**. Enter the same `slug` as in `products.js` and the number in `stock`. Click **Save**.

If you forget step 2, the print shows as "Sold out".

## How a purchase lowers the stock

The stock is lowered in **two** ways, so that it always happens:

```
 The customer pays at Stripe
        │
        ├──▶ A. The customer is sent to the thank-you page (/success?session_id=…),
        │       which asks /api/confirm-order to check the order.
        │       The server asks Stripe: is the order paid?
        │
        ├──▶ B. Stripe sends "payment completed" to /api/stripe-webhook
        │       (only if the webhook is connected, see below).
        │       The server checks that the message comes from Stripe.
        │
        ▼   both: ask Stripe which prints were bought (lib/orders.js)
 Supabase: the process_order function
        │   • has the order already been counted? Then nothing happens.
        │   • otherwise: the stock is lowered for each print
        ▼
 The site shows the new stock to the next visitor
```

If both A and B happen, the order is still only counted once.

**A** works right away, even on your own computer without the Stripe CLI. **B** is needed if the customer closes the tab before the thank-you page has loaded.

The checkout (`/api/checkout`) also checks the stock in Supabase **before** the customer can pay. So it isn't possible to buy more than there are.

## Showing it in a presentation
1. Check in Supabase that the print has, for example, `10` in stock.
2. Put 10 of it in the cart and go to the checkout.
3. Pay with the test card `4242 4242 4242 4242`, a future date (for example 12/30) and any CVC. Enter any address.
4. You land on the thank-you page. Click **Back to the shop**: the print shows "Sold out", and in Supabase `stock` is `0`.
5. Afterwards: set `stock` back in Supabase. It shows on the site within a minute.

## The files

| File | What it does |
|---|---|
| `lib/inventory.js` | Reads the stock from Supabase and lowers it after a purchase |
| `lib/orders.js` | Asks Stripe which prints were bought and lowers the stock |
| `app/api/confirm-order/route.js` | The thank-you page asks it to confirm the order with Stripe (A above) |
| `app/api/stripe-webhook/route.js` | Receives "payment completed" from Stripe (B above) |
| `app/api/stock/route.js` | Gives the cart the stock, so you can't add too many |
| `supabase/setup.sql` | The SQL that created the tables (run on 9 November 2026) |

There are two tables in Supabase:
- **inventory**: the stock, one row per print.
- **processed_orders**: which orders have already been counted. It only exists so the same order isn't counted twice. Don't touch it.

## The keys

They are in `.env.local`, and in Vercel under *Settings → Environment Variables*.

| Name | What | Secret? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | The project address | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | May only **read** the stock | No |
| `SUPABASE_SECRET_KEY` | May change everything in the database. Used only on the server | **Yes!** |
| `STRIPE_WEBHOOK_SECRET` | Proves the message comes from Stripe (starts with `whsec_`) | **Yes!** |

If a secret key has leaked, for example been sent in a chat, create a new one in Supabase (*Project Settings → API Keys*) and replace it in `.env.local` and in Vercel.

## Connecting the webhook in Stripe

The stock goes down through the thank-you page even without this step. But if a customer closes the tab before the thank-you page loads, the order is only counted through the webhook, so connect it before the shop opens for real.

### When the site is on the internet (Vercel)
1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. Address: `https://YOUR-DOMAIN/api/stripe-webhook`
3. Choose the events **`checkout.session.completed`** and **`checkout.session.async_payment_succeeded`**.
4. Save. Then click **Reveal** under *Signing secret* and copy the key (`whsec_…`).
5. Add it as `STRIPE_WEBHOOK_SECRET` in Vercel, and add the three Supabase keys there too. Publish again.

Do this both in test mode and, when the shop opens, in live mode. They have different `whsec_` keys.

### When testing on your own computer
Stripe can't reach `localhost` directly. Use the **Stripe CLI**:
```
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook
```
The last line prints a `whsec_…` key. Add it as `STRIPE_WEBHOOK_SECRET=` in `.env.local` and restart `npm run dev`. Keep `stripe listen` running while you test a purchase with the test card `4242 4242 4242 4242`.

## Good to know

- **Two customers at the same time.** If two people pay for the last print at exactly the same moment, both purchases can go through. The stock then stops at 0, and Luna has to refund one of them in Stripe. This is very rare in a small shop.
- **The free version of Supabase pauses projects** that haven't been used for a while. The shop then shows old stock, and the checkout replies "Could not check the stock". Sign in to Supabase and click **Restore project**.
- **The build needs Supabase.** `npm run build` reads the stock, so Supabase must be running when the site is published.
