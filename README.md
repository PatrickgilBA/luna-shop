# Luna – online shop for risograph prints

An online shop where the artist Luna sells her risograph prints. Visitors can browse the work, add prints to a cart, choose a quantity and pay by card with Stripe. Stock is kept in a Supabase database and goes down automatically after each purchase.

The design takes inspiration from artist portfolios such as [eglezvirblyte.com](https://www.eglezvirblyte.com/): a visual landing page with a tight grid of images and looping videos, before you enter the shop.

**Built with:** Next.js 16 (App Router) · React 19 · Supabase (PostgreSQL) · Stripe Checkout · plain CSS · JavaScript

---

## Features

- **Landing page** with a grid of images and looping videos in different sizes
- **Shop** with every print, and a page per print with a gallery and price
- **Quantity selector** on the product page, max 10 of the same print per order
- **Cart** saved in the browser, with shipping zones (EU / worldwide)
- **Stripe Checkout**: prices and stock are always checked on the server
- **Stock in Supabase**: shows "Sold out" at 0 and goes down after each paid order, through a Stripe webhook and a server-side check on the thank-you page. The same order is never counted twice.
- Responsive layout, semantic HTML, keyboard focus styles, alt texts, and respect for "reduce motion"

---

## Getting started

You need **Node.js** (version 20 or later).

1. Install the dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your own keys (see below).
3. Set up the database: in Supabase, open **SQL Editor**, paste the contents of [`supabase/setup.sql`](supabase/setup.sql) and click **Run**.
4. Start the development server:
   ```
   npm run dev
   ```
5. Open the address shown in the terminal, usually **http://localhost:3000**.

To test a purchase, use Stripe's test card `4242 4242 4242 4242`, any future date and any CVC.

### Environment variables

| Name | What it is | Secret? |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_…` for testing) | **Yes** |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the Stripe webhook (`whsec_…`) | **Yes** |
| `NEXT_PUBLIC_SITE_URL` | The site's address, e.g. `http://localhost:3000` | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key, can only **read** stock | No |
| `SUPABASE_SECRET_KEY` | Supabase secret key, used only on the server | **Yes** |

`.env.local` is in `.gitignore` and is never uploaded.

---

## How a purchase works

```
Browser                         Server (Next.js)                    Stripe / Supabase
───────                         ────────────────                    ─────────────────
Add to cart (saved in browser)
Checkout  ──────────────────▶   /api/checkout
                                • checks prints exist
                                • checks quantity ≤ stock ──────▶   Supabase: read stock
                                • looks up the real prices
                                • creates a payment page ───────▶   Stripe Checkout
Customer pays on Stripe  ◀──────────────────────────────────────    redirect to /success
/success ───────────────────▶   /api/confirm-order
                                • asks Stripe: is it paid? ─────▶   Stripe
                                • lowers the stock ─────────────▶   Supabase: process_order
                                /api/stripe-webhook  ◀───────────   Stripe "payment completed"
                                (same function, counted only once)
```

---

## Project structure

```
├── app/                    ← pages and API routes (Next.js App Router)
│   ├── page.js             ← landing page
│   ├── shop/               ← shop and product pages
│   ├── cart/, success/, about/
│   └── api/                ← checkout, stock, confirm-order, stripe-webhook
├── components/             ← reusable React components (header, cart, video …)
├── data/
│   ├── products.js         ← all prints (name, price, size, images)
│   ├── home.js             ← which images and videos are on the landing page
│   └── site.js             ← name, email, Instagram, About text
├── lib/
│   ├── inventory.js        ← reads and updates stock in Supabase
│   ├── orders.js           ← lowers stock after a paid order
│   ├── limits.js           ← max prints of the same kind per order
│   ├── shipping.js         ← shipping zones and prices
│   └── format.js           ← price formatting
├── supabase/setup.sql      ← database tables, security rules and function
├── public/                 ← images and videos shown on the site
└── docs/                   ← detailed documentation (in Swedish)
```

---

## Documentation

The detailed guides in [`docs/`](docs/) are written in Swedish, for the shop owner:

| File | Topic |
|---|---|
| [01-krav-fran-intervjun.md](docs/01-krav-fran-intervjun.md) | Requirements from the interview with the client |
| [02-ordlista.md](docs/02-ordlista.md) | Glossary of technical terms |
| [03-hur-sidan-ar-byggd.md](docs/03-hur-sidan-ar-byggd.md) | How the site is built, file by file |
| [04-andra-produkter.md](docs/04-andra-produkter.md) | Changing prints and prices |
| [05-stripe-betalning.md](docs/05-stripe-betalning.md) | Setting up Stripe payments |
| [06-publicera-pa-internet.md](docs/06-publicera-pa-internet.md) | Publishing the site |
| [07-logg-och-att-gora.md](docs/07-logg-och-att-gora.md) | Changelog and to-do list |
| [08-supabase-lager.md](docs/08-supabase-lager.md) | Stock in Supabase and the Stripe webhook |
