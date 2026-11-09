# 4. Editing prints and prices

Almost everything you want to change in the shop is in **one file: `data/products.js`**.
The **stock** (how many are left), however, is in the Supabase database. See [08](08-supabase-stock.md).

Open `data/products.js` in VS Code. Each print looks like this:

```js
  {
    slug: "catsuit",
    title: "Catsuit",
    size: "A4 (21 × 29.7 cm)",
    price: 30,
    images: ["/images/products/catsuit-1.jpg", "/images/products/catsuit-2.jpg"],
    description: "A very cool cat in a very blue suit. Risograph print on thick paper.",
  },
```

> **Rules so nothing breaks**
> - Text goes inside quotes: `"Catsuit"`. Numbers do *not* have quotes: `30`.
> - Every line ends with a comma `,`.
> - Every print starts with `{` and ends with `},`.
> - If the text needs a `"`, write `\"` instead.
> - If the site shows a red error message after a change, you have probably lost a comma or a quote. Look at the line the error points to.

## Change price, name, size or description
Change the value and save (⌘ + S). If `npm run dev` is running, the change shows on localhost right away.
On the internet it shows after you publish again (see [06](06-publishing.md)).

## Stock and "Sold out"
Stock goes down automatically after each purchase. To change it by hand, for example after restocking or to mark a print as sold out (0), do it in Supabase. See [08](08-supabase-stock.md).

## Remove a print completely
Delete everything from `{` up to and including `},` for that print. Its row in Supabase can stay, it does no harm.

## Change the order in the shop
Prints are shown in the same order as in the file. Move a whole `{ … },` block up or down.

## Add a new print
1. **Prepare the image.** It should be at most about 1600 pixels on the longest side, and a `.jpg`. On a Mac: open the image in Preview → Tools → Adjust Size. Or in Terminal:
   ```
   sips -Z 1600 "path/to/image.jpg" --out public/images/products/new-name-1.jpg
   ```
2. **Put the image** in `public/images/products/`. Use only lowercase letters, numbers and hyphens in the file name (no spaces or special characters like å/ä/ö).
3. **Copy an existing `{ … },` block** in `products.js` and paste it where you want the new print.
4. **Change all the values.** `slug` must be unique, for example `"blue-cat"`.
5. **Add the print in Supabase** with the same `slug` and the number in stock (see [08](08-supabase-stock.md)). Otherwise it shows as "Sold out".
6. Save and check on localhost.

The first image in `images` is shown in the shop grid. The others are shown as small images on the product page.

## Go through the placeholders (TODO)
When the site was built, only three prints had a real name, price and size. Everything else is guessed and marked with `// TODO`.
Search for **TODO** in VS Code (⌘ + Shift + F) to find them all. Remove `// TODO` when the line is correct.

## Other things you can change

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
