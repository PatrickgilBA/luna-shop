# 4. Editing prints and prices

Every print (name, price, size, description, images and stock) is stored in the **`products` table in Supabase**. The easiest way to change them is the **admin page** on the site. Changes show in the shop right away. No publishing needed.

*(Until 9 November 2026 the prints were in `data/products.js`. That file is gone.)*

## Sign in
1. Go to **https://luna-shop-ten.vercel.app/admin**, or click **Admin** at the very bottom of any page.
2. Sign in with the admin email and password. You stay signed in for up to 30 days on that browser.

You see every print with its price and stock.

## Change a print
1. Click **Edit** on its row.
2. Change the name, price, stock, size, description, images or order. **Upload images** adds new photos; **Remove** takes one away.
3. Click **Save changes**. You're taken back to the list, with a green "Saved" message.

The form checks every field when you leave it, and again when you save. A field with a problem turns red and says what is wrong, for example *"The price must be more than 0."* The server checks everything once more, so the rules can't be skipped.

- **Price**: in euro, `30` or `30.50` (a comma works too).
- **Stock**: how many are left. `0` shows "Sold out". It also goes down automatically after each purchase.
- **Order in the shop**: lowest number first. The prints go up in steps of 10, so `15` puts a print between 10 and 20.

The **slug** (the address, `/shop/catsuit`) can't be changed, because it is in links and in customers' carts.

## Add a print
1. On the admin page, click **+ Add a print**.
2. Fill in the name, price, stock and size. The slug (the address) is filled in from the name; change it if you like.
3. Click **Upload images** and choose one or more photos, from a computer or a phone. Big photos are made smaller automatically (at most 1600 pixels), so they load fast. Each one shows as a small preview.
4. The image marked **In the shop** is the one shown in the shop grid. **Remove** takes an image away.
5. Click **Add print**. It shows in the shop right away, at `/shop/new-name`.

Uploaded images are stored in **Supabase Storage**, in the `product-images` bucket. The original 24 prints use images in the code (`/images/products/…`); both kinds work side by side. Under **Image addresses (advanced)** you can see and edit the addresses directly.

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
