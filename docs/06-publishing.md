# 6. Publishing the site on the internet

To let others see the site, it has to be on a server. We use **Vercel**: free for small sites, made for Next.js, and no servers to manage.

**Status:** the code is on GitHub at https://github.com/PatrickgilBA/luna-shop. Vercel is not connected yet.

## Overview
```
Your computer  ──(git push)──→  GitHub  ──(automatic)──→  Vercel  ──→  luna-shop.vercel.app
```
Every time a change is pushed to GitHub, Vercel rebuilds the site automatically, in about a minute. For every pull request, Vercel also builds a **preview** with its own link, so a change can be checked before it goes live.

## Step by step (first time)

### 1. Put the code on GitHub ✔ done
The repository was created with the GitHub CLI (`gh repo create`). The `.gitignore` file makes sure the original images (too big), `node_modules` and `.env.local` (the secret keys) are *not* uploaded.

### 2. Connect GitHub to Vercel
1. Go to https://vercel.com and sign in with your GitHub account.
2. **Add New → Project** → choose the `luna-shop` repository → **Import**.
3. Open **Environment Variables** and add every variable from `.env.local` (see the table in [08](08-supabase-stock.md) and the README):
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
   - `NEXT_PUBLIC_SITE_URL` = the site's address, for example `https://luna-shop.vercel.app`. You only know the address after step 4. Fill it in then and click "Redeploy".
4. Click **Deploy**. After about a minute the site is live.
5. Connect the Stripe webhook to the new address (see [08](08-supabase-stock.md)) and add `STRIPE_WEBHOOK_SECRET` in Vercel.

### 3. Your own domain (optional)
Buy for example `lunaprints.com` from a domain seller (or directly in Vercel). Add it under *Project → Settings → Domains* and follow the instructions. Then update `NEXT_PUBLIC_SITE_URL`.

## Updating the site later
1. Create a new branch for the change.
2. Change the files (for example `data/products.js`) and check that it looks right with `npm run dev`.
3. Commit and push the branch, and open a pull request on GitHub.
4. Check the preview link from Vercel in the pull request.
5. Merge the pull request. Vercel updates the live site automatically.
