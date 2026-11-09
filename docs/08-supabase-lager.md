# 8. Lagret i Supabase

Hur många som finns kvar av varje poster ligger i databasen **Supabase**, inte i koden. När någon köper räknas lagret ner automatiskt. När det når 0 står det "Sold out" och postern går inte att köpa.

## Ändra lagret för hand

1. Logga in på [supabase.com](https://supabase.com/dashboard) och öppna projektet.
2. Klicka på **Table Editor** (rutnätsikonen i vänstermenyn) → tabellen **inventory**.
3. Dubbelklicka på siffran i kolumnen `stock`, skriv den nya siffran och tryck Enter.

Ändringen syns på hemsidan inom **en minut**. Ingen publicering behövs.

- **Slutsåld:** sätt `stock` till `0`.
- **Fyllt på:** skriv det nya antalet.

## Lägga till en ny poster

En ny poster behöver finnas på **två** ställen:

1. I `data/products.js`, med namn, pris och bilder (se [04](04-andra-produkter.md)).
2. I Supabase: **Table Editor → inventory → Insert → Insert row**. Skriv samma `slug` som i `products.js` och antalet i `stock`. Klicka **Save**.

Glömmer du steg 2 visas postern som "Sold out".

## Så räknas ett köp ner

Lagret räknas ner på **två** sätt, så att det alltid blir av:

```
 Kunden betalar hos Stripe
        │
        ├──▶ A. Kunden skickas till tack-sidan (/success?session_id=…)
        │       som ber /api/confirm-order kolla köpet.
        │       Servern frågar Stripe: är köpet betalt?
        │
        ├──▶ B. Stripe skickar "betalning klar" till /api/stripe-webhook
        │       (bara om webhooken är inkopplad, se nedan).
        │       Servern kollar att meddelandet kommer från Stripe.
        │
        ▼   båda: frågar Stripe vilka posters som köptes (lib/orders.js)
 Supabase: funktionen process_order
        │   • har köpet redan räknats? Då händer inget.
        │   • annars: lagret minskas för varje poster
        ▼
 Hemsidan visar det nya lagret för nästa besökare
```

Sker både A och B räknas köpet ändå bara en gång.

**A** fungerar direkt, även på din egen dator utan Stripe CLI. **B** behövs om kunden stänger fliken innan tack-sidan hunnit visas.

Kassan (`/api/checkout`) kollar också lagret i Supabase **innan** kunden får betala. Det går alltså inte att köpa fler än det finns.

## Visa det i en redovisning
1. Kolla i Supabase att postern har till exempel `10` i lager.
2. Lägg 10 av den i varukorgen och gå till kassan.
3. Betala med testkortet `4242 4242 4242 4242`, ett datum i framtiden (till exempel 12/30) och valfri CVC. Fyll i valfri adress.
4. Du kommer till tack-sidan. Klicka **Back to the shop**: postern visar "Sold out", och i Supabase står `stock` på `0`.
5. Efteråt: sätt tillbaka `stock` i Supabase. Det syns på sidan inom en minut.

## Filerna

| Fil | Vad den gör |
|---|---|
| `lib/inventory.js` | Hämtar lagret från Supabase och räknar ner det efter köp |
| `lib/orders.js` | Frågar Stripe vilka posters som köptes och räknar ner lagret |
| `app/api/confirm-order/route.js` | Tack-sidan ber den bekräfta köpet hos Stripe (A ovan) |
| `app/api/stripe-webhook/route.js` | Tar emot "betalning klar" från Stripe (B ovan) |
| `app/api/stock/route.js` | Ger varukorgen lagret, så att man inte kan lägga för många i den |
| `supabase/setup.sql` | SQL-koden som skapade tabellerna (kördes 9 november 2026) |

I Supabase finns två tabeller:
- **inventory**: lagret, en rad per poster.
- **processed_orders**: vilka köp som redan räknats. Den finns bara för att samma köp inte ska räknas två gånger. Rör den inte.

## Nycklarna

De ligger i `.env.local`, och på Vercel under *Settings → Environment Variables*.

| Namn | Vad | Hemlig? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Projektets adress | Nej |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Får bara **läsa** lagret | Nej |
| `SUPABASE_SECRET_KEY` | Får ändra allt i databasen. Används bara av webhooken | **Ja!** |
| `STRIPE_WEBHOOK_SECRET` | Bevisar att meddelandet kommer från Stripe (börjar med `whsec_`) | **Ja!** |

Har en hemlig nyckel kommit ut, till exempel skickats i en chatt, skapa en ny i Supabase (*Project Settings → API Keys*) och byt i `.env.local` och på Vercel.

## Koppla in webhooken hos Stripe

Lagret räknas ner via tack-sidan även utan det här steget. Men om en kund stänger fliken innan tack-sidan visas räknas köpet bara med webhooken, så koppla in den innan butiken öppnar på riktigt.

### När sidan ligger på internet (Vercel)
1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. Adress: `https://DIN-DOMÄN/api/stripe-webhook`
3. Välj händelserna **`checkout.session.completed`** och **`checkout.session.async_payment_succeeded`**.
4. Spara. Klicka sedan på **Reveal** under *Signing secret* och kopiera nyckeln (`whsec_…`).
5. Lägg in den som `STRIPE_WEBHOOK_SECRET` på Vercel, och lägg även in de tre Supabase-nycklarna där. Publicera igen.

Gör det här både i testläge och, när butiken öppnar, i live-läge. De har olika `whsec_`-nycklar.

### När du testar på din egen dator
Stripe kan inte nå `localhost` direkt. Använd **Stripe CLI**:
```
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook
```
Den sista raden skriver ut en `whsec_…`-nyckel. Lägg in den som `STRIPE_WEBHOOK_SECRET=` i `.env.local` och starta om `npm run dev`. Låt `stripe listen` vara igång medan du testar ett köp med testkortet `4242 4242 4242 4242`.

## Bra att veta

- **Två kunder samtidigt.** Om två personer betalar för den sista postern exakt samtidigt kan båda köpen gå igenom. Lagret stannar då på 0, och Luna får återbetala den ena i Stripe. Det är mycket ovanligt i en liten butik.
- **Gratisversionen av Supabase pausar projekt** som inte använts på en tid. Då visar butiken gammalt lager och kassan svarar "Could not check the stock". Logga in på Supabase och klicka **Restore project**.
- **Bygget behöver Supabase.** `npm run build` hämtar lagret, så Supabase måste vara igång när sidan publiceras.
