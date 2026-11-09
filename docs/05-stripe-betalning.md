# 5. Koppla in betalningen (Stripe)

Utan Stripe-nyckel fungerar allt utom sista steget. Klickar man "Checkout" visas ett felmeddelande om att betalningen inte är inställd än.

## Steg 1 – Skapa ett Stripe-konto (gratis)
1. Gå till https://dashboard.stripe.com/register och skapa ett konto.
2. Du hamnar i **testläge** (en brytare uppe i hörnet). Där är alla pengar låtsas, perfekt för att prova.

## Steg 2 – Hämta den hemliga nyckeln
1. I Stripe: **Developers → API keys** (eller https://dashboard.stripe.com/test/apikeys).
2. Kopiera **Secret key**. Den börjar med `sk_test_…`.

> ⚠️ **Den hemliga nyckeln är som ett lösenord till kontot.** Skicka den aldrig i mejl eller chatt, och lägg den aldrig i koden. Den ska bara finnas i `.env.local` och i Vercels inställningar.

## Steg 3 – Lägg in nyckeln på din dator
1. I projektmappen: kopiera filen `.env.example` och döp kopian till `.env.local`.
   (Filer som börjar med punkt är dolda i Finder. Tryck ⌘ + Shift + . för att visa dem, eller gör det i VS Code.)
2. Öppna `.env.local` och ersätt `sk_test_BYT_UT_MIG` med din nyckel.
3. Starta om sidan (Ctrl + C i terminalen, sedan `npm run dev` igen).

## Steg 4 – Testa ett köp
1. Lägg en poster i varukorgen och klicka **Checkout**.
2. På Stripes sida, använd testkortet:
   - Kortnummer: `4242 4242 4242 4242`
   - Datum: vilket framtida datum som helst, till exempel `12/34`
   - CVC: vilka tre siffror som helst
3. Du ska hamna på "Thank you!"-sidan och varukorgen ska vara tom.
4. I Stripe → **Payments** syns köpet med kundens adress.

## Steg 5 – När du ska ta emot riktiga pengar
1. I Stripe: slutför aktiveringen av kontot (personuppgifter och bankkonto för utbetalningar).
2. Byt till **live-läge** och hämta den nya nyckeln, som börjar med `sk_live_`.
3. Lägg live-nyckeln i **Vercels** inställningar (se [06](06-publicera-pa-internet.md)), *inte* i koden.

## Bra inställningar i Stripe
- **Kvitton till kunden:** Settings → Business → Customer emails → slå på "Successful payments".
- **Mejl till dig vid varje köp:** Settings → Personal details → Communication preferences → "Successful payments".
- **Ordrar:** Payments-fliken. Klicka på en betalning för att se namn, adress, telefon och vilka posters som köptes.

## Att tänka på
- Stripe tar en avgift per köp (ungefär 1,5 % + 0,25 € för europeiska kort, mer för kort utanför EU). Kolla aktuella priser på stripe.com/pricing.
- **Moms och skatt:** Att sälja konst innebär regler om moms och deklaration. Det beror på hur mycket du säljer och vart. Kolla med Skatteverket eller en redovisningskonsult. Stripe har en tilläggstjänst, *Stripe Tax*, om det behövs senare.
- Lagret minskar automatiskt vid köp, via en *webhook* från Stripe till Supabase. Den måste kopplas in hos Stripe, se [08](08-supabase-lager.md).
