# 7. Changelog and to-do

## Changelog

### 9 November 2026 – the prints moved to Supabase
- New table `products` in Supabase with every print: slug, title, size, price, description, images, stock and sort order (`supabase/02-products.sql`). The 24 prints were generated straight from the old `data/products.js`, and the stock was copied over.
- Row Level Security: everyone may read products, nobody may change them with the public key. The database refuses empty names, prices ≤ 0, negative stock and invalid slugs.
- `inventory` became a read-only view of `products`, so the live site kept working during the switch. `process_order` now lowers the stock in `products`.
- `data/products.js`, `lib/inventory.js` and `/api/stock` were removed. The site reads everything through `lib/products.js`; the cart gets the prints through `/api/products`. New prints get their page the first time someone visits it.
- `supabase/setup.sql` was renamed to `supabase/01-setup.sql`. `docs/08-supabase-stock.md` was renamed to `docs/08-supabase.md`, and `docs/04-editing-products.md` now explains how to edit prints in Supabase.
- **Tested:**
  - 72 automatic tests pass; `npm run build` passes.
  - The public key can read products but not change a price or add a print (Supabase refuses).
  - Every page works; an unknown print gives 404.
  - Changing the price of *Moth* to €31.50 in Supabase made Stripe charge exactly 3150 cents.
  - A real test purchase of 2 *Moth* with the 4242 card lowered the stock in `products` from 10 to 8, and the site showed 8 right away. Everything was reset afterwards.

### 9 November 2026 – automatic tests and CI
- 97 automatic tests with Vitest in `tests/` (run with `npm test`): the shop data and landing page grid, the stock in Supabase, the checkout, the thank-you page check and the Stripe webhook. Stripe and Supabase are replaced by fakes in the tests.
- To check that the tests really catch mistakes, the stock check and the 10-per-print limit were broken on purpose: three tests failed, as they should. Then the code was restored.
- GitHub Actions (`.github/workflows/ci.yml`) installs, tests and builds the site on every pull request and push to `main`. The build needs the Supabase URL and publishable key, stored as repository secrets.

### 9 November 2026 – live on Vercel
- Next.js was upgraded from 16.4.0 to 16.4.5 to fix three known security holes (pull request #1). `npm audit` reports 0 vulnerabilities.
- The GitHub repository was connected to Vercel, with the keys from `.env.local` as environment variables. The site is live at https://luna-shop-ten.vercel.app
- **Tested on the live site:** every page, image and video loads, the stock is read from Supabase, the checkout rejects 11 of the same print and creates a real Stripe test payment page.

### 9 November 2026 – Git, GitHub and English documentation
- The project was put under version control with Git and uploaded to a public GitHub repository: https://github.com/PatrickgilBA/luna-shop
- The original images and videos are kept out of the repository (`.gitignore`); only the resized copies in `public/` are uploaded. No secret keys are uploaded.
- The README and every document in `docs/` were translated from Swedish to English, and the files got English names.

### 9 November 2026 – contact details and a smaller name
- Luna's real email (lunamarinagil@gmail.com) and Instagram (@lunamarinagil) were added to `data/site.js`. They are shown in the footer and on the About page.
- The name "Luna" on the landing page was made about half as big.

### 9 November 2026 – choose a quantity on the product page
- The product page has a quantity selector (− 1 +) next to "Add to cart" (`components/AddToCartButton.js`).
- You can have at most **10 of the same print** in one order. The number is in `lib/limits.js` and applies to the product page, the cart and the checkout on the server. If there are fewer in stock, the stock is the limit.
- **Tested:** `npm run build` with no errors. In the browser: added 5 to the cart, then could only add 5 more. The button showed "Max 10 per print". The checkout rejects 11.

### 9 November 2026 – stock goes down even without the webhook
- The thank-you page sends the order id to the new `/api/confirm-order`. The server asks Stripe whether the order is paid and, if so, lowers the stock. This works locally without the Stripe CLI, for example for a presentation.
- The code that lowers the stock moved to `lib/orders.js` and is used by both the thank-you page and the webhook. An order is only counted once, even if both run.
- The "Back to the shop" button on the thank-you page reloads the shop fully, so the new stock shows immediately.
- **Tested:** `npm run build` with no errors. A real test purchase in the browser of 10 *Moth* with the 4242 card on Stripe's payment page: the stock in Supabase went from 10 to 0, and the product page showed "Sold out" immediately. The stock was reset afterwards.

### 9 November 2026 – videos on the landing page
- Four animations from the `Videor Luna/` folder were added to `public/videos/` with readable names: `blue-creature`, `tulip-vase`, `snake` and `spotted-cat`. The originals are untouched.
- `spotted-cat.mp4` was made smaller with the Mac's `avconvert`, from 9 MB to 3.3 MB (640 × 420 pixels). The others were already small.
- Each video has a still image (`.jpg`) shown while it loads.
- In the landing page grid (`data/home.js`) the videos play silently on a loop, in the same kind of tiles as the images. The spotted cat video replaced the still image of the same print. The snake, the blue creature and the tulip got new tiles, together with the image *Flower Friends*.
- The videos were then spread over the page: the spinning dog at the top right, the snake in the middle, the blue creature and the tulip at the bottom.
- New component: `components/LoopingVideo.js`. The video stays still for visitors who have turned off animations on their computer.
- **Tested:** `npm run build` with no errors, and screenshots on desktop (1440 px) and mobile (390 px). The grid has no gaps.

### 9 November 2026 – stock in Supabase
- A Supabase project was created and the database was set up with `supabase/setup.sql`: the `inventory` table (stock), the `processed_orders` table and the `process_order` function. Row Level Security is on, so visitors may only read the stock.
- `stock` was removed from `data/products.js`. The stock is now read from Supabase (`lib/inventory.js`). The shop and product pages update at least once a minute, and immediately after a purchase.
- The checkout checks the stock in Supabase before payment. The cart gets the stock through `/api/stock`.
- New Stripe webhook, `/api/stripe-webhook`, lowers the stock when an order is paid. The same order is never counted twice.
- No new packages. Supabase is called with plain `fetch`.
- **Tested:**
  - `npm run build` with no errors.
  - The publishable key can read the stock but not change it or run `process_order`.
  - The checkout refuses when you want more than are in stock, and when a print is sold out.
  - The webhook refuses messages without a Stripe signature.
  - The whole chain with a real payment page in Stripe's test mode and a signed "paid" message: the stock went from 10 to 9 and showed on the site immediately, and a repeated message was not counted again. Everything was reset afterwards.
- **Not tested yet:** a purchase where Stripe itself sends the webhook. The thank-you page lowers the stock even without it, see above. It needs the Stripe CLI or the site to be on the internet (see [08](08-supabase.md)).
- **Security:** `npm audit` shows that Next.js 16.4.0 has known serious security holes. 16.4.5 fixes them. Not upgraded yet.

### 22 October 2026 – new look
- Inspiration: artist portfolios such as [eglezvirblyte.com](https://www.eglezvirblyte.com/) and a Readymag page by Nikita Lukyanov.
- **New landing page** (`app/page.js`): a large name with floating images, a short introduction, a collage of images in different sizes and a large "Enter the shop" link. The images and their placement are changed in `data/home.js`.
- **The shop moved** from `/` to `/shop` (`app/shop/page.js`). All links ("Back to shop" etc.) point there.
- **New look everywhere** (`app/globals.css`): light paper, lots of space, no thick borders or shadows. Headings in the *Ultra* font, riso blue as the accent colour.
- `priority` on images was replaced by `preload` (`priority` is deprecated in Next.js 16).
- The functions (cart, stock, Stripe checkout) were not changed.
- The collage was made tighter: every row fills the full width, with less space between rows and less offset.
- The landing page was redone again, closer to eglezvirblyte.com: no images over the name any more, and the collage was replaced by a tight grid (4 columns on desktop, 2 on mobile) with tiles in four sizes and narrow gaps. The title shows in a blue box on hover. The blue scrolling strip was kept.
- **Tested:** `npm run build` with no errors. Screenshots of the landing page, shop, product page and About on desktop (1440 px) and the landing page on mobile (390 px).

### 8 October 2026 – first version
- Interview about the requirements (see [01](01-requirements.md)).
- The project was created with **Next.js 16.4, React 19.3 and Stripe 23** (`package.json`).
- The code was written in plain JavaScript, not TypeScript, to be easier to read for a beginner.
- 36 product images and 4 portraits were resized from 289 MB to about 17 MB with the Mac's built-in `sips` tool.
- 24 prints were identified from the images and added to `data/products.js`. 21 of them have placeholders (TODO).
- Pages built: shop, product page, About, cart, thank-you page, 404.
- The checkout with Stripe Checkout was built, with two shipping zones (EU / rest of the world).
- **Tested:**
  - `npm run build` passes with no errors.
  - All pages were checked with screenshots on desktop and mobile (375 px wide).
  - The checkout rejects: too many copies, prints that don't exist, negative quantities, an empty cart and an unknown shipping zone.
  - The country list in `lib/shipping.js` was checked against Stripe's list of allowed countries.

## To-do

### Must be done before the shop opens
- [ ] Check the names, sizes and prices of the 21 guessed prints in Supabase ([04](04-editing-products.md)).
- [x] Upgrade Next.js to 16.4.5 or later (security holes in 16.4.0).
- [x] Add the Supabase keys in Vercel.
- [ ] Connect the Stripe webhook to the live site ([08](08-supabase.md)).
- [ ] Create new Supabase keys (the current ones were sent in a chat) and replace them in `.env.local`.
- [x] Real email and Instagram in `data/site.js`.
- [ ] Real About text in `data/site.js`.
- [ ] Real shipping prices in `lib/shipping.js`.
- [x] Create a Stripe account and test a purchase with the test card ([05](05-stripe-payments.md)).
- [x] Put the code on GitHub.
- [x] Publish on Vercel ([06](06-publishing.md)).
- [ ] Switch to the Stripe live key.
- [ ] Check the rules for VAT and tax.

### Ideas for later
- ~~**Automatic stock.**~~ Done 9 November 2026, see [08](08-supabase.md).
- **Free shipping over a certain amount**, for example "Free shipping over €60".
- **More shipping zones**, for example one for Sweden / the Nordics.
- **Contact form** or newsletter.
- **Categories or filters** (A3 / A4 / A5) if there are many prints.
- **Swedish as a second language.**
