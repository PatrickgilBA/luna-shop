# 2. Glossary – technical terms explained simply

**Website / web page**
Text, images and code that a web browser (Chrome, Safari …) shows.

**HTML**
The language that describes *what* is on a page: headings, images, buttons.

**CSS**
The language that describes *how* it looks: colours, sizes, fonts. All our CSS is in `app/globals.css`.

**JavaScript (JS)**
The programming language that makes the page interactive, for example the cart counting up when you click. All `.js` files in the project are JavaScript.

**React**
A tool (library) for building pages out of small reusable **components**. A component is a building block, for example "a product card". We write the component once and use it 24 times, once per print.

**JSX**
What looks like HTML inside the JavaScript files, for example `<h1>{product.title}</h1>`. `{ }` means "insert the value of this".

**Next.js**
A framework built on top of React. It handles things React doesn't do on its own:
- **Pages from folders.** The file `app/about/page.js` automatically becomes the address `/about`.
- **Server.** Some code runs on a server instead of on the visitor's computer, for example the checkout, which uses a secret key.
- **Images.** Images are automatically made smaller and faster (the `<Image>` component).
- **Speed.** Pages are built in advance so they load quickly.

**Server / client**
- The *client* is the visitor's browser. Anything that runs there, the visitor can see and change.
- The *server* is the computer that sends out the page. What runs there is hidden from the visitor.

Files that start with `"use client"` run in the browser. The others run on the server.

**API / API route**
An address that programs talk to instead of people. `app/api/checkout/route.js` is one of our API routes: the cart sends it what the customer wants to buy, and gets back a link to Stripe's payment page.

**Stripe**
A company that handles card payments. We send the customer to Stripe, the customer pays there, and Stripe sends the customer back to our thank-you page.

**Stripe Checkout / Checkout Session**
Stripe's ready-made payment page. A "session" is a single purchase.

**Test mode / live mode (Stripe)**
In test mode the money is pretend, and you pay with the test card 4242 4242 4242 4242. In live mode it's real money.

**Webhook**
A message one service sends to another when something happens. Stripe sends our site a webhook when a payment is completed, so we can lower the stock.

**Supabase**
A service that gives us a database (PostgreSQL) on the internet. We keep the stock there.

**Database / table**
A place to store data in an organised way, a bit like a spreadsheet. The `products` table has one row per print, with its name, price and stock.

**Row Level Security (RLS)**
Rules in Supabase that decide who may read or change which rows. Ours let visitors *read* the stock, but not change it.

**Environment variable / `.env.local`**
A secret setting that must not be in the code, for example the Stripe key. It is saved in the file `.env.local`, which is never uploaded anywhere.

**Node.js**
The program that runs JavaScript on your computer (outside the browser). Needed for Next.js.

**npm**
Comes with Node.js. Downloads libraries (React, Next, Stripe) and runs commands:
- `npm install`: download everything listed in `package.json`
- `npm run dev`: start the site on your computer to work on it
- `npm run build`: build a finished version (done automatically when the site is published)

**`package.json`**
A list of which libraries the project uses, and which commands exist.

**`node_modules/`**
The folder where `npm install` puts all downloaded libraries. It is large and can always be downloaded again, so you never touch it and it is not uploaded.

**localhost**
"This computer". `http://localhost:3000` is the site running on your own computer. Only you can see it.

**localStorage**
A small storage space in the browser. The cart is saved there, so it is still there if you close the tab.

**Slug**
The short part of an address that identifies something, for example `catsuit` in `/shop/catsuit`.

**Deploy / publish / hosting**
Putting the site on the internet. **Vercel** is a company (made by the same people as Next.js) where this is free and simple. See [06-publishing.md](06-publishing.md).

**Git / GitHub**
Git saves "versions" of the code (commits) so you can go back. GitHub is a website where the code is stored. Vercel can fetch the code from there.

**Branch / pull request (PR)**
A branch is a copy of the code where you make a change without touching the main version (`main`). A pull request is a request on GitHub to merge that change into `main`. You can see exactly which lines changed, and tests and a preview of the site can run first.

**CI/CD**
*Continuous integration / continuous deployment.* Every change is automatically tested (CI) and published (CD).

**TODO**
Programmer slang for "to do". Search for `TODO` in the code to find what is left.

**Terminal**
The program where you type commands as text. On a Mac: ⌘ + space, type "Terminal".
