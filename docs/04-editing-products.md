# 4. Editing prints and prices

Every print (name, price, size, description, images and stock) is stored in the **`products` table in Supabase**. The easiest way to change them is the **admin page** on the site. Changes show in the shop right away. No publishing needed.

*(Until 9 November 2026 the prints were in `data/products.js`. That file is gone.)*

## Sign in
1. Go to **https://luna-shop-ten.vercel.app/admin**, or click **Admin** at the very bottom of any page.
2. Sign in with the admin email and password. You stay signed in for up to 30 days on that browser.

You see every print with its price and stock.

## Change a print
1. Click **Edit** on its row.
2. Change the name, price, stock, size, description, images or order.
3. Click **Save changes**. You're taken back to the list, with a green "Saved" message.

The form checks every field when you leave it, and again when you save. A field with a problem turns red and says what is wrong, for example *"The price must be more than 0."* The server checks everything once more, so the rules can't be skipped.

- **Price**: in euro, `30` or `30.50` (a comma works too).
- **Stock**: how many are left. `0` shows "Sold out". It also goes down automatically after each purchase.
- **Images**: one address per line. The first one is shown in the shop grid.
- **Order in the shop**: lowest number first. The prints go up in steps of 10, so `15` puts a print between 10 and 20.

The **slug** (the address, `/shop/catsuit`) can't be changed, because it is in links and in customers' carts.

## Add a print
1. **Put the image on the site** (until image upload is added):
   - Make it at most about 1600 pixels on the longest side, as a `.jpg`. On a Mac: open it in Preview → Tools → Adjust Size.
   - Put it in `public/images/products/`, with only lowercase letters, numbers and hyphens in the file name, and publish it (commit, push and merge, see [06](06-publishing.md)).
2. On the admin page, click **+ Add a print**.
3. Fill in the form. The slug is filled in from the name; change it if you like.
4. In **Images**, write the image's address, for example `/images/products/new-name-1.jpg`. A small preview shows if the address is right.
5. Click **Add print**. It shows in the shop right away, at `/shop/new-name`.

## Delete a print
Click **Edit** on its row, then **Delete this print** at the bottom, and confirm. It disappears from the shop right away. If someone has it in their cart, it is removed from the cart.

## In Supabase instead
Everything above can also be done in Supabase: **Table Editor → products**. Double-click a cell to change it, **Insert → Insert row** to add, right-click → **Delete row** to delete. The same database rules apply (no empty names, no price of 0 or less, no negative stock).

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
