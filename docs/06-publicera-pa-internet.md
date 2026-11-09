# 6. Publicera sidan på internet

Än så länge finns sidan bara på din dator (localhost). För att andra ska se den måste den läggas på en server. Vi rekommenderar **Vercel**: gratis för små sidor, gjort för Next.js, och inga servrar att sköta.

**Inget av detta är gjort än.** Det är nästa steg när produkterna är klara.

## Översikt
```
Din dator  ──(git push)──→  GitHub  ──(automatiskt)──→  Vercel  ──→  luna.vercel.app
```
Varje gång du sparar en ändring till GitHub bygger Vercel om sidan automatiskt, på ungefär en minut.

## Steg för steg (första gången)

### 1. Lägg koden på GitHub
1. Skapa ett konto på https://github.com.
2. Installera **GitHub Desktop** (https://desktop.github.com). Det är enklare än terminalen.
3. I GitHub Desktop: *File → Add Local Repository* → välj mappen `Hemsida Luna 2`. Om den frågar, välj "create a repository".
4. Klicka **Publish repository**. Bocka gärna i "Keep this code private".

Filen `.gitignore` ser till att originalbilderna (för stora), `node_modules` och `.env.local` (hemliga nyckeln) *inte* laddas upp.

### 2. Koppla GitHub till Vercel
1. Gå till https://vercel.com och logga in med ditt GitHub-konto.
2. **Add New → Project** → välj ditt repository → **Import**.
3. Öppna **Environment Variables** och lägg till:
   - `STRIPE_SECRET_KEY` = din Stripe-nyckel (först `sk_test_…`, senare `sk_live_…`)
   - `NEXT_PUBLIC_SITE_URL` = sidans adress, till exempel `https://luna.vercel.app`. Den första adressen vet du först efter steg 4. Fyll i den då och klicka "Redeploy".
4. Klicka **Deploy**. Efter ungefär en minut är sidan ute.

### 3. Egen domän (valfritt)
Köp till exempel `lunaprints.com` hos en domänsäljare (eller direkt i Vercel). Lägg till den under *Project → Settings → Domains* och följ instruktionerna. Uppdatera sedan `NEXT_PUBLIC_SITE_URL`.

## Uppdatera sidan senare
1. Ändra filerna (till exempel `data/products.js`).
2. Kolla att det ser rätt ut med `npm run dev`.
3. I GitHub Desktop: skriv en kort beskrivning (till exempel "Sänkt lager Catsuit") → **Commit** → **Push**.
4. Vercel uppdaterar sidan automatiskt.
