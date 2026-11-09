# 7. Changelog and to-do

## Changelog

### 9 November 2026 – image upload
- New Supabase Storage bucket `product-images` (`supabase/04-storage.sql`): public to read, only admins may upload, replace and delete. Only JPEG, PNG and WebP up to 5 MB.
- The product form has an **Upload images** button (`components/ImageUpload.js`). Photos are made at most 1600 pixels and saved as JPEG in the browser first (`lib/resize-image.js`), then sent to `/api/admin/images`, which uploads them with the admin's own login. Previews show which image is used in the shop, with a **Remove** button.
- Images may now only come from the site (`/images/…`) or from the bucket; other addresses are refused, because Next.js couldn't show them. `next.config.mjs` allows the bucket.
- **Tested:**
  - In the database with temporary accounts: a visitor and an ordinary account can't upload; an admin can; a text file is refused; everyone can see the image; an ordinary account can't delete, an admin can. (The first try showed that admins also need a "select" rule to delete; it was added.)
  - In a real browser with a temporary admin: a 32 MB original photo was uploaded in 3.4 s and became 301 kB; the print was saved and the image showed on the product page through Next.js image optimisation. The test print, image and account were deleted afterwards.
  - 143 automatic tests pass (13 new); `npm run build` passes.

### 9 November 2026 – add, edit and delete prints from the admin page
- The admin page has **+ Add a print** and an **Edit** link on every row. The edit page also has **Delete this print**, which asks before deleting.
- New routes `/api/admin/products` (POST: add) and `/api/admin/products/[slug]` (PATCH: change, DELETE: delete). They only accept a signed-in admin and requests from our own website, and they call Supabase with the admin's own login, so the database's rules (`is_admin()`) decide too.
- The form (`app/admin/products/ProductForm.js`) checks each field when you leave it and again when you save, with the same rules as the server (`validateProduct` in `lib/validation.js`): name, size, price > 0 with at most two decimals, whole-number stock ≥ 0, 1–10 images starting with `/images/` or `https://`, and a valid unique slug. The slug is filled in from the name, and can't be changed later.
- After a change the shop is refreshed at once.
- A small **Admin** link was added to the footer. Shared form field component: `components/FormField.js`.
- **Tested:**
  - In a real browser with a temporary admin account: empty and bad fields show the right messages; a new test print was saved, showed in the shop at €12.50; the same slug was refused; changing it to €13 and stock 0 showed "Sold out"; deleting asked first, then the page gave 404. The test print and account were deleted afterwards.
  - The routes refuse visitors who aren't signed in (401).
  - Bugs found and fixed while testing: an empty "order" field was refused, a price like €0.29 would have been refused because of how computers store decimals, the order number wasn't read from the database, and an old slug error stayed after the slug was filled in.
  - 130 automatic tests pass (38 new); `npm run build` passes.

### 9 November 2026 – admin login
- An admin account (pgil@itba.edu.ar) was created in Supabase Auth, and public sign-ups were turned off.
- New table `admins`, function `is_admin()` and Row Level Security rules: only admins may add, change and delete prints (`supabase/03-admin.sql`).
- New pages `/admin/login` (sign-in form) and `/admin` (every print with price and stock), and routes `/api/admin/login` and `/api/admin/logout`.
- The form is checked in the browser and again on the server, with the same rules (`lib/validation.js`). Errors are shown under each field and read out by screen readers.
- The login is kept in httpOnly cookies and renewed by `proxy.js` (Next.js 16's name for middleware). Admin routes refuse requests from other websites.
- **Tested:**
  - In the database, with temporary accounts: an ordinary account can't change a price, add a print or make itself admin; an admin can add, change and delete a print, but not set the price to 0. The temporary accounts were deleted.
  - Public sign-up is refused ("Signups not allowed").
  - In a real browser, with temporary accounts: a visitor who isn't signed in is sent to the login; empty fields, a bad email and a wrong password show the right messages; an ordinary account is refused; the admin gets in and sees 24 prints; the login is renewed when it expires; signing out works. The temporary accounts were deleted.
  - 92 automatic tests pass (20 new for the login); `npm run build` passes.

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
- [ ] Use a stronger admin password (the current one is short and easy to guess).
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
