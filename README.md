# Luna – online shop for risograph prints

**Live site:** https://luna-shop-ten.vercel.app

An online shop where the artist Luna sells her risograph prints. Visitors can browse the work, add prints to a cart, choose a quantity and pay by card with Stripe. Every print, with its price and stock, is stored in a Supabase database, and the stock goes down automatically after each purchase.

The design takes inspiration from artist portfolios such as [eglezvirblyte.com](https://www.eglezvirblyte.com/): a visual landing page with a tight grid of images and looping videos, before you enter the shop.

**Built with:** Next.js 16 (App Router) · React 19 · Supabase (PostgreSQL) · Stripe Checkout · plain CSS · JavaScript

---

## Features

- **Landing page** with a grid of images and looping videos in different sizes
- **Shop** with every print, and a page per print with a gallery and price
- **Quantity selector** on the product page, max 10 of the same print per order
- **Cart** saved in the browser, with shipping zones (EU / worldwide)
- **Stripe Checkout**: prices and stock are always checked on the server
- **Prints and stock in Supabase**: name, price, images and stock come from the database. Shows "Sold out" at 0 and goes down after each paid order, through a Stripe webhook and a server-side check on the thank-you page. The same order is never counted twice.
- **Admin login** at `/admin`: email and password through Supabase Auth, only for accounts on the database's admin list. Form validation in the browser and on the server, sessions in httpOnly cookies that renew themselves
- Responsive layout, semantic HTML, keyboard focus styles, alt texts, and respect for "reduce motion"

---

## Getting started

You need **Node.js** (version 20 or later).

1. Install the dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your own keys (see below).
3. Set up the database: in Supabase, open **SQL Editor** and run the files in [`supabase/`](supabase/) in order (`01-setup.sql`, `02-products.sql`, `03-admin.sql`). Then create an admin account under **Authentication → Users** and turn off **Allow new users to sign up** (see [docs/08](docs/08-supabase.md)).
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

## Tests and CI

```
npm test
```

runs 92 automatic tests with [Vitest](https://vitest.dev) (in [`tests/`](tests/)):

- **`data.test.js`**: the prints in `supabase/02-products.sql` have unique slugs and existing images, the landing page grid has no gaps, shipping zones don't overlap.
- **`products.test.js`**: reading prints from Supabase, lowering the stock after an order, and only refreshing the pages when an order is new.
- **`auth.test.js`**: login form validation, the login and logout routes (wrong password, non-admin accounts, other websites), and the proxy that renews the login.
- **`api.test.js`**: the checkout (server prices, stock, max 10 per print, invalid input), the thank-you page check and the Stripe webhook (signatures, unpaid orders, retries).

Stripe and Supabase are replaced by fakes in the tests, so they never create payments or change the real stock.

**GitHub Actions** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) installs, tests and builds the site on every pull request and every push to `main`. **Vercel** builds a preview for every pull request and publishes `main` to the live site.

---

## How a purchase works

```
Browser                         Server (Next.js)                    Stripe / Supabase
───────                         ────────────────                    ─────────────────
Add to cart (saved in browser)
Checkout  ──────────────────▶   /api/checkout
                                • checks prints exist
                                • reads prices and stock ───────▶   Supabase: products
                                • checks quantity ≤ stock and ≤ 10
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
│   ├── admin/              ← admin page and login (only for admins)
│   └── api/                ← checkout, products, confirm-order, stripe-webhook, admin login/logout
├── components/             ← reusable React components (header, cart, video …)
├── data/
│   ├── home.js             ← which images and videos are on the landing page
│   └── site.js             ← name, email, Instagram, About text
├── lib/
│   ├── products.js         ← reads the prints and stock from Supabase
│   ├── auth.js             ← admin login with Supabase Auth
│   ├── validation.js       ← form rules, shared by the browser and the server
│   ├── orders.js           ← lowers stock after a paid order
│   ├── limits.js           ← max prints of the same kind per order
│   ├── shipping.js         ← shipping zones and prices
│   └── format.js           ← price formatting
├── supabase/               ← SQL for the database tables, security rules and function
├── tests/                  ← automatic tests (npm test)
├── .github/workflows/      ← CI: tests and build on every pull request
├── proxy.js                ← renews the admin login before admin pages load
├── public/                 ← images and videos shown on the site
└── docs/                   ← detailed documentation
```

---

## Documentation

Detailed guides are in [`docs/`](docs/):

| File | Topic |
|---|---|
| [01-requirements.md](docs/01-requirements.md) | Requirements from the interview with the client |
| [02-glossary.md](docs/02-glossary.md) | Glossary of technical terms |
| [03-how-the-site-is-built.md](docs/03-how-the-site-is-built.md) | How the site is built, file by file |
| [04-editing-products.md](docs/04-editing-products.md) | Changing prints, prices and stock |
| [05-stripe-payments.md](docs/05-stripe-payments.md) | Setting up Stripe payments |
| [06-publishing.md](docs/06-publishing.md) | Publishing the site |
| [07-changelog-and-todo.md](docs/07-changelog-and-todo.md) | Changelog and to-do list |
| [08-supabase.md](docs/08-supabase.md) | The database, its security and the Stripe webhook |
