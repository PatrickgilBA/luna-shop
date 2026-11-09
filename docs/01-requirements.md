# 1. Requirements from the interview

Before anything was built, we held a short interview (8 October 2026). These are the answers, and what each one meant for how the site was built.

Some decisions changed later, for example the look of the site and how stock works. Those changes are noted below and described in [07-changelog-and-todo.md](07-changelog-and-todo.md).

## Basic requirements (from the first message)

| Requirement | How it was solved |
|---|---|
| A website that sells prints | An online shop with a cart and card payment |
| Similar to junioneda.com and eglezvirblyte.com | Same idea: the artwork in a grid, one page per work and a simple About page. Little text, images in focus |
| Built with React and Next.js | Next.js 16 and React 19 (the latest versions in October 2026) |
| Images from "Riso print" and "Artist intro pic" | Resized copies are in `public/images/`. The originals are untouched |
| Document everything, explained simply | This `docs/` folder, plus comments in the code |

## Interview questions and answers

### How should customers pay?
**Answer: Stripe Checkout.**
The customer clicks "Checkout" and is sent to a secure payment page at Stripe. There they can pay by card, Apple Pay or Google Pay. The money goes to Luna's Stripe account.
*Why Stripe:* we never have to handle card numbers ourselves (that is both hard and regulated), and there is no monthly fee, only a small fee per purchase.

### Which language?
**Answer: English.**
All text that visitors see is in English.

### Which pages?
**Answer: Shop and About.**
- **Shop**: all prints in a grid. Each print has its own page (`/shop/name`).
- **About** (`/about`): text about Luna and four portraits.
- Plus the pages a shop needs: cart (`/cart`), a thank-you page after a purchase (`/success`) and a "page not found" page.
- Contact details (email and Instagram) are in the footer and on About, instead of on a separate page.

*Changed 22 October 2026:* the shop moved to `/shop`, and `/` became a visual landing page with images and videos.

### What is the artist / shop called?
**Answer: Luna.**

### Product information for images without a name or price?
**Answer: Placeholders.**
Only three images had a name, size and price in the file name:
- Catsuit, A4, €30
- Greetings Friends, A3, €35
- Protector, A5, €14

Some had only a name (Tiger, Free as a Bird, Flower Pot, Butterflyman, Grid and Weave, Seasons of Change). The rest were just called `DSC_1689` or similar. Names were made up from what the images show, sizes and prices were guessed, and everything uncertain is marked with `// TODO` in `data/products.js`.
**Luna needs to check and correct these.** See [04-editing-products.md](04-editing-products.md).

### Where should prints be shipped?
**Answer: Worldwide.**
In the cart, the customer chooses between two shipping zones:
- **EU**: cheaper (placeholder €6)
- **Rest of the world**: more expensive (placeholder €15)

Stripe then only lets the customer enter an address in the chosen zone, so nobody can choose EU shipping and send to the USA. Shipping costs the same however many prints you buy. Prices are changed in `lib/shipping.js`.

### Limited number (stock)?
**Answer: Yes, show "Sold out".**
Every print has a stock number. At 0 it says "Sold out" and it can't be bought. The customer can't put more in the cart than there are.

*Changed 9 November 2026:* stock is now in the Supabase database and goes down automatically after each purchase (see [08-supabase-stock.md](08-supabase-stock.md)).

### Which style?
**Answer (8 October): colourful and playful.**
The first version used bright riso ink colours, the rounded font *Bagel Fat One*, thick dark borders and "hard" shadows.

*Changed 22 October 2026:* the look was made calmer and more editorial, like an artist portfolio: light paper background, lots of space, the font *Ultra* for headings and riso blue as the accent colour. The scrolling blue text strip was kept.
