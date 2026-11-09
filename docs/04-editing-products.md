# 4. Editing prints and prices

Every print (name, price, size, description, images and stock) is stored in the **`products` table in Supabase**, not in the code. You change them there, and the site updates by itself within a minute. No publishing needed.

*(Until 9 November 2026 the prints were in `data/products.js`. That file is gone.)*

## Open the table
1. Sign in at [supabase.com](https://supabase.com/dashboard) and open the project.
2. Click **Table Editor** (the grid icon in the left menu) → **products**.

Each row is one print:

| Column | What it is | Example |
|---|---|---|
| `slug` | Short id used in the web address, `/shop/catsuit`. Only lowercase letters, numbers and hyphens. Must be unique | `catsuit` |
| `title` | The name shown on the site | `Catsuit` |
| `size` | The size shown on the site | `A4 (21 × 29.7 cm)` |
| `price` | Price in euro | `30` |
| `description` | A short text about the print | `A very cool cat …` |
| `images` | The images, as a list. The first one is shown in the shop grid | `{/images/products/catsuit-1.jpg,/images/products/catsuit-2.jpg}` |
| `stock` | How many are left. `0` = "Sold out" | `10` |
| `sort_order` | Order in the shop, lowest first | `10` |

The database refuses values that would break the shop: an empty name, a price of 0 or less, negative stock, or a slug with spaces or capital letters.

## Change price, name, size, description or stock
Double-click the cell, type the new value and press Enter. It shows on the site within **one minute**.

The stock goes down automatically after each purchase, so you only change it by hand after restocking, or to mark a print as sold out (`0`).

## Change the order in the shop
Change `sort_order`. Prints are shown from the lowest number to the highest. The numbers go up in steps of 10 (10, 20, 30 …), so you can put a print in between, for example `15`.

## Add a new print
1. **Prepare the image.** It should be at most about 1600 pixels on the longest side, and a `.jpg`. On a Mac: open the image in Preview → Tools → Adjust Size. Or in Terminal:
   ```
   sips -Z 1600 "path/to/image.jpg" --out public/images/products/new-name-1.jpg
   ```
2. **Put the image** in `public/images/products/` and publish it (commit, push and merge, see [06](06-publishing.md)). Use only lowercase letters, numbers and hyphens in the file name.
3. In Supabase: **products → Insert → Insert row**. Fill in `slug`, `title`, `size`, `price`, `description`, `images` (for example `{/images/products/new-name-1.jpg}`) and `stock`. Click **Save**.

The new print shows in the shop within a minute, and gets its own page at `/shop/new-name`.

*Coming soon: forms on the admin page (`/admin`) for this, including image upload. Today the admin page shows every print with its price and stock.*

## Remove a print
Right-click the row → **Delete row**. It disappears from the shop within a minute. If someone has it in their cart, it is removed from the cart.

## Check the placeholders
When the site was built, only three prints had a real name, price and size (Catsuit, Greetings Friends and Protector). The other 21 names, sizes and prices were guessed from the images. **Luna needs to check them in the table.**

## Other things you can change (in the code)

| What | Where |
|---|---|
| Email, Instagram link, About text | `data/site.js` |
| Shipping prices and delivery times | `lib/shipping.js` (`price` and `deliveryText`) |
| Images and videos on the landing page | `data/home.js` |
| The portraits on About | Replace the images in `public/images/artist/` (keep the file names) |
| Colours | At the top of `app/globals.css`, under `:root` |
| Text in the scrolling strip | `app/layout.js`, the line with `<Marquee text="…" />` |
| Max number of the same print per order (now 10) | `lib/limits.js` |
| Text under "Add to cart" (about riso and frames) | `app/shop/[slug]/page.js` |

Changes in the code show on the live site after they are published (see [06](06-publishing.md)).
