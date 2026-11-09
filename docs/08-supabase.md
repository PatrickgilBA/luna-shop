# 8. The database (Supabase)

Every print, with its price and stock, is stored in the **Supabase** database. The site reads it from there. When someone buys, the stock goes down automatically. At 0 it says "Sold out" and the print can't be bought.

How to change prints, prices and stock by hand: see [04-editing-products.md](04-editing-products.md).

## The tables

| Table | What it holds |
|---|---|
| **products** | One row per print: slug, title, size, price, description, images, stock, sort order |
| **processed_orders** | Which Stripe orders have already lowered the stock. It only exists so the same order is never counted twice. Don't touch it |
| **admins** | Which Supabase Auth accounts are admins. Only they may add, change or delete prints |
| **inventory** | Not a real table but a *view*: a read-only mirror of `slug` and `stock` from products. Kept so older versions of the site keep working |

The SQL that created them is in [`supabase/`](../supabase/):

| File | Run on | What it does |
|---|---|---|
| `01-setup.sql` | 9 Nov 2026 | The first stock table, `processed_orders` and the `process_order` function |
| `02-products.sql` | 9 Nov 2026 | The `products` table with the 24 prints; stock moved into it |
| `03-admin.sql` | 9 Nov 2026 | The `admins` table, the `is_admin()` function, and rules that let admins change products |
| `04-storage.sql` | 9 Nov 2026 | The `product-images` storage bucket, and rules that let only admins upload and delete images |

Run them in that order, once, in **SQL Editor → Run**, to set up a new Supabase project. Never run them again in the same project.

## Security (Row Level Security)

Row Level Security is on for every table:
- **Everyone may read** `products` (it is the shop, after all).
- **Nobody may change** anything with the public key, or as a signed-in account that isn't an admin. Supabase refuses with "violates row-level security policy". This was tested.
- **Admins** (accounts in the `admins` table) may add, change and delete prints. Nobody can add themselves to the list.
- Only the server, with the **secret key**, may run `process_order`, which lowers the stock.
- The database refuses impossible values: empty names, prices of 0 or less, negative stock, and slugs with spaces or capital letters.

## Admin accounts

The admin signs in at **/admin/login** with an email and password. The accounts are kept by **Supabase Auth** (Authentication → Users), not in our tables.

- **Sign-ups are turned off** (Authentication → Sign In / Providers → *Allow new users to sign up*). Nobody can create an account from the outside; Supabase answers "Signups not allowed".
- Being signed in isn't enough: the account must also be in the `admins` table. The site asks the database (`is_admin()`) on every visit to `/admin`.
- The login is kept in two cookies that the page's JavaScript can't read (httpOnly). It lasts about an hour and is then renewed automatically by `proxy.js`, for up to 30 days.

### Add another admin
1. **Authentication → Users → Add user → Create new user**. Enter the email and a password, keep *Auto Confirm User* ticked.
2. In **SQL Editor**, run (with the right email):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'new-admin@example.com';
   ```

### Remove an admin
Delete the account under **Authentication → Users**. It disappears from `admins` automatically.

## Images (Supabase Storage)

Images uploaded on the admin page are stored in the **`product-images` bucket** (Supabase → **Storage**).
- **Everyone** can see an image through its public address (it is shown in the shop).
- **Only admins** can upload, replace or delete images. Others get "violates row-level security policy". This was tested.
- Only **JPEG, PNG and WebP** up to **5 MB** are accepted by the bucket (the site itself allows 4 MB, and makes photos smaller before upload).
- Each image gets a unique name (date + random id), so two uploads never overwrite each other.
- `next.config.mjs` allows Next.js to show images from this bucket, and no other outside address.

Deleting a print doesn't delete its images from the bucket. They take little space, but they can be removed under **Storage → product-images**.

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

The checkout (`/api/checkout`) also reads prices and stock straight from Supabase **before** the customer can pay. So it isn't possible to buy more than there are, or to pay an old price.

## Showing it in a presentation
1. Check in Supabase that the print has, for example, `10` in stock.
2. Put 10 of it in the cart and go to the checkout.
3. Pay with the test card `4242 4242 4242 4242`, a future date (for example 12/30) and any CVC. Enter any address.
4. You land on the thank-you page. Click **Back to the shop**: the print shows "Sold out", and in Supabase `stock` is `0`.
5. Afterwards: set `stock` back in Supabase. It shows on the site within a minute.

You can also change a price in Supabase and show that the shop and the Stripe payment page use the new price.

## The files

| File | What it does |
|---|---|
| `lib/products.js` | Reads the prints from Supabase, and lowers the stock after a purchase |
| `lib/orders.js` | Asks Stripe which prints were bought and lowers the stock |
| `app/api/products/route.js` | Gives the cart the prints (name, price, image, stock) |
| `app/api/confirm-order/route.js` | The thank-you page asks it to confirm the order with Stripe (A above) |
| `app/api/stripe-webhook/route.js` | Receives "payment completed" from Stripe (B above) |

Pages are cached for up to 60 seconds so they load fast. After a purchase, the cache is cleared at once.

## The keys

They are in `.env.local`, in Vercel under *Settings → Environment Variables*, and (the first two) in GitHub under *Settings → Secrets and variables → Actions* for the automatic build.

| Name | What | Secret? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | The project address | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | May only **read** | No |
| `SUPABASE_SECRET_KEY` | May change everything in the database. Used only on the server | **Yes!** |
| `STRIPE_WEBHOOK_SECRET` | Proves the message comes from Stripe (starts with `whsec_`) | **Yes!** |

If a secret key has leaked, for example been sent in a chat, create a new one in Supabase (*Project Settings → API Keys*) and replace it in `.env.local` and in Vercel.

## Connecting the webhook in Stripe

The stock goes down through the thank-you page even without this step. But if a customer closes the tab before the thank-you page loads, the order is only counted through the webhook, so connect it before the shop opens for real.

### On the live site (Vercel)
1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. Address: `https://luna-shop-ten.vercel.app/api/stripe-webhook`
3. Choose the events **`checkout.session.completed`** and **`checkout.session.async_payment_succeeded`**.
4. Save. Then click **Reveal** under *Signing secret* and copy the key (`whsec_…`).
5. Add it as `STRIPE_WEBHOOK_SECRET` in Vercel and redeploy.

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

- **One database for everything.** Your computer (`localhost`) and the live site use the same Supabase project. A test purchase on `localhost` lowers the stock on the live site too.
- **Two customers at the same time.** If two people pay for the last print at exactly the same moment, both purchases can go through. The stock then stops at 0, and Luna has to refund one of them in Stripe. This is very rare in a small shop.
- **The free version of Supabase pauses projects** that haven't been used for a while. The shop then can't load, and the checkout replies "Could not check the stock". Sign in to Supabase and click **Restore project**.
- **The build needs Supabase.** `npm run build` reads the prints, so Supabase must be running when the site is published.
