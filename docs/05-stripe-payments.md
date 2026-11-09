# 5. Setting up payments (Stripe)

Without a Stripe key, everything works except the last step. Clicking "Checkout" shows an error message saying payments aren't set up yet.

## Step 1 – Create a Stripe account (free)
1. Go to https://dashboard.stripe.com/register and create an account.
2. You start in **test mode** (a switch in the corner). All money there is pretend, perfect for trying things out.

## Step 2 – Get the secret key
1. In Stripe: **Developers → API keys** (or https://dashboard.stripe.com/test/apikeys).
2. Copy the **Secret key**. It starts with `sk_test_…`.

> ⚠️ **The secret key is like a password to the account.** Never send it by email or chat, and never put it in the code. It should only be in `.env.local` and in Vercel's settings.

## Step 3 – Add the key on your computer
1. In the project folder: copy the file `.env.example` and name the copy `.env.local`.
   (Files that start with a dot are hidden in Finder. Press ⌘ + Shift + . to show them, or do it in VS Code.)
2. Open `.env.local` and replace `sk_test_REPLACE_ME` with your key.
3. Restart the site (Ctrl + C in the terminal, then `npm run dev` again).

## Step 4 – Test a purchase
1. Put a print in the cart and click **Checkout**.
2. On Stripe's page, use the test card:
   - Card number: `4242 4242 4242 4242`
   - Date: any future date, for example `12/34`
   - CVC: any three digits
3. You should land on the "Thank you!" page, and the cart should be empty.
4. The stock in Supabase goes down by the number you bought (see [08](08-supabase-stock.md)).
5. In Stripe → **Payments** you can see the purchase with the customer's address.

## Step 5 – When you want to receive real money
1. In Stripe: finish activating the account (personal details and a bank account for payouts).
2. Switch to **live mode** and get the new key, which starts with `sk_live_`.
3. Put the live key in **Vercel's** settings (see [06](06-publishing.md)), *not* in the code.

## Useful Stripe settings
- **Receipts to the customer:** Settings → Business → Customer emails → turn on "Successful payments".
- **Email to you for every purchase:** Settings → Personal details → Communication preferences → "Successful payments".
- **Orders:** the Payments tab. Click a payment to see the name, address, phone and which prints were bought.

## Things to keep in mind
- Stripe charges a fee per purchase (about 1.5% + €0.25 for European cards, more for cards outside the EU). Check current prices at stripe.com/pricing.
- **VAT and tax:** selling art comes with rules about VAT and tax returns. It depends on how much you sell and where. Check with the tax authority or an accountant. Stripe has an add-on, *Stripe Tax*, if needed later.
- Stock goes down automatically after a purchase, through the thank-you page and a Stripe *webhook*. The webhook needs to be connected in Stripe, see [08](08-supabase-stock.md).
