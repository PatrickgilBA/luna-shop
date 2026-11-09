# 3. How the site is built

## The pages and which file makes them

In Next.js, **folders in `app/`** decide which addresses exist. The file called `page.js` is the page itself.

| Address | File | What it shows |
|---|---|---|
| `/` | `app/page.js` | The landing page. Luna's name, a tight grid of images and videos in different sizes (the title shows on hover) and a link into the shop. The images are chosen in `data/home.js` |
| `/shop` | `app/shop/page.js` | The shop. All prints in a grid |
| `/shop/catsuit` (etc.) | `app/shop/[slug]/page.js` | One print: images, price, size, quantity and "Add to cart" |
| `/about` | `app/about/page.js` | About Luna, with portraits |
| `/cart` | `app/cart/page.js` | The cart, shipping choice and "Checkout" |
| `/success` | `app/success/page.js` | "Thank you!" after payment |
| (wrong address) | `app/not-found.js` | "Oops! This page doesn't exist" |
| `/admin/login` | `app/admin/login/page.js` | Sign-in form for the admin (`LoginForm.js`) |
| `/admin` | `app/admin/page.js` | The admin page: every print with price and stock, with links to add and edit. Only for admins, everyone else is sent to `/admin/login` |
| `/admin/products/new` | `app/admin/products/new/page.js` | Form to add a print (`ProductForm.js`) |
| `/admin/products/catsuit` (etc.) | `app/admin/products/[slug]/page.js` | Form to edit a print, and a button to delete it (`DeleteButton.js`) |
| `/api/admin/login`, `/api/admin/logout` | `app/api/admin/…/route.js` | Not pages. Sign in and out (see [08](08-supabase.md)) |
| `/api/admin/products`, `/api/admin/products/catsuit` | `app/api/admin/products/…/route.js` | Not pages. Add (POST), change (PATCH) and delete (DELETE) prints, only for admins |
| `/api/checkout` | `app/api/checkout/route.js` | Not a page. The checkout, which talks to Stripe |
| `/api/confirm-order` | `app/api/confirm-order/route.js` | Not a page. The thank-you page asks it to check the order with Stripe and lower the stock |
| `/api/stripe-webhook` | `app/api/stripe-webhook/route.js` | Not a page. Stripe reports payments here, and the stock is lowered in Supabase |
| `/api/products` | `app/api/products/route.js` | Not a page. Gives the cart the prints (name, price, image, stock) from Supabase |

`[slug]` in square brackets means "anything". One and the same file is used for all 24 product pages.

## The frame around every page

`app/layout.js` is the frame that shows on every page:

```
┌────────────────────────────────────────┐
│  Luna              Shop  About  Cart 2 │  ← components/Header.js
├────────────────────────────────────────┤
│  RISO PRINTS · MADE BY HAND · …  →→→   │  ← components/Marquee.js
├────────────────────────────────────────┤
│                                        │
│           (the current page)           │  ← the page.js files
│                                        │
├────────────────────────────────────────┤
│  email · Instagram · © 2026 Luna       │  ← components/Footer.js
└────────────────────────────────────────┘
```

## The components (building blocks) in `components/`

| File | What it does |
|---|---|
| `Header.js` | Logo and menu. Shows the number of items in the cart |
| `Footer.js` | The footer |
| `Marquee.js` | The scrolling text strip |
| `LoopingVideo.js` | A video that plays silently on a loop, in the landing page grid |
| `ProductCard.js` | A card in the shop grid (image, name, price, "Sold out") |
| `ProductGallery.js` | Large image plus small images to click, on the product page |
| `AddToCartButton.js` | The quantity selector (− 1 +) and the "Add to cart" button |
| `FormField.js` | A form field with its label, hint and error message (used by the admin forms) |
| `CartContext.js` | **The brain of the cart.** Remembers what the customer chose and shares it with every page |

## Data: the information that is shown

| File | Contents |
|---|---|
| `data/site.js` | Name, email, Instagram, About text |
| `data/home.js` | Which images and videos are in the landing page grid, and how big they are (small/big/tall/wide) |
| `lib/products.js` | Reads every print (name, price, size, images, description, stock) from Supabase (see [08](08-supabase.md)) |
| `lib/orders.js` | Lowers the stock after a paid order |
| `lib/auth.js` | Admin login with Supabase Auth: sign in, sign out, "is this account an admin?" |
| `lib/validation.js` | Form rules (login and prints), used both in the browser and on the server |
| `lib/admin-api.js` | Shared checks for the admin routes: same website, signed-in admin |
| `proxy.js` | Runs before the admin pages and renews the login when it has expired |
| `lib/limits.js` | Max number of the same print per order (10) |
| `lib/shipping.js` | Shipping zones, prices and countries |
| `lib/format.js` | Turns 30 into "€30.00" |
| `app/globals.css` | All design (colours, fonts, sizes) |

## What happens when someone buys – step by step

```
 Customer                  Our site                         Stripe / Supabase
 ────────                  ────────                         ─────────────────
 1. Chooses a quantity, clicks "Add to cart"
    → saved in the browser (CartContext + localStorage)

 2. Goes to /cart, chooses EU or World,
    clicks "Checkout"
                     ──→  3. /api/checkout (on the server):
                             • checks the prints exist
                             • checks quantity ≤ stock ──────────→  Supabase
                               and ≤ 10
                             • looks up the REAL price in Supabase
                             • asks Stripe for a payment page  ──→  4. Creates the page
                     ←──────────────────────────────────────────────  and replies with a link
 5. Is sent to Stripe's payment page,
    enters address and card                                    ──→  6. Takes the money,
                                                                       emails a receipt
 7. Is sent back to /success
    → the cart is emptied
    → /api/confirm-order asks Stripe if it is paid
      and lowers the stock ─────────────────────────────────────→  Supabase
      (the Stripe webhook does the same; the order is only counted once)

                                                                  8. Luna sees the order in
                                                                     the Stripe Dashboard and
                                                                     posts the print
```

**Why does the server check the price?** Anything in the browser can be changed by a skilled visitor. That's why the browser only sends *which* prints and *how many*. The price is always looked up on the server.

## The images

- The originals in `Riso print/` and `Artist intro pic/` were 289 MB, some more than 8000 pixels wide. That is far too big for a web page.
- Resized copies (max 1600 pixels, about 17 MB in total) are in `public/images/products/` and `public/images/artist/`.
- Next.js `<Image>` makes them even smaller automatically, depending on the screen size.
- Everything in the `public/` folder can be reached on the site. `public/images/products/catsuit-1.jpg` becomes the address `/images/products/catsuit-1.jpg`.
- The videos on the landing page are in `public/videos/`, each with a still image (`.jpg`) shown while it loads.

### Which original image became which file?

| Web file | Original in "Riso print" |
|---|---|
| catsuit-1 / -2 | Catsuit_A4_30 Euro… / DSC_1700_1 |
| flower-pot-1 / -2 / -3 | Flower pot_In medow / DSC_1701_1 / DSC_1707_2 |
| free-as-a-bird-1 / -2 | Free as a bird frame / DSC_1711_1 |
| greetings-friends-1 / -2 | Greetings freiens_A3… / DSC_1722_1 |
| protector-1 / -2 / -3 / -4 | Protector_A5…(2) / Protector_A5…(1) / Protector A3 room / Protector screen print |
| tiger-1 / -2 | Tiger in frame_Render / DSC_1715_1 |
| butterflyman-1 / -2 | butterflyman frame / DSC_1704_1 |
| grid-and-weave-1 / -2 | grid and weave in room / DSC_1720_1 |
| seasons-of-change-1 / -2 | seasons of change in chair remake / DSC_1697_1 |
| high-five-1 | DSC09808 |
| sun-hug-1 | DSC09820 |
| fire-horse-1 | DSC09838 |
| spotted-cat-1 | DSC_1579_1 |
| cat-and-bunny-1 | DSC_1689_1 |
| all-in-1 | DSC_1691_1 |
| resting-dog-1 | DSC_1692_1 |
| purple-flowers-1 | DSC_1694_1 |
| big-hug-1 | DSC_1702_2 |
| moon-cats-1 | PNP02851 |
| flower-friends-1 | PNP02877 |
| red-cat-1 | PNP02894 |
| dont-let-fear-1 | PNP02947 |
| night-garden-1 | PNP02978 |
| moth-1 | PNP02998 |

| Web file | Original in "Artist intro pic" |
|---|---|
| luna-1 (large image on About) | DSC_1735_1 |
| luna-2 | Luna_Artist pic |
| luna-3 | PNP03069 |
| luna-4 | 03092026-VANNI_03092026_85-52 |

| Web file | Original in "Videor Luna" |
|---|---|
| tulip-vase | 378962e5-… |
| blue-creature | 593c2ecb-… |
| snake | ac06a743-… |
| spotted-cat | grok-video-9297aaf6-… (resized) |

The `Batik/` and `IKEA/` folders were already in the project folder but are not used by the site. None of the original folders are uploaded to GitHub.
