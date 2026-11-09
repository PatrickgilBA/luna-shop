# 4. Ändra posters och priser

Nästan allt du vill ändra i butiken finns i **en fil: `data/products.js`**.
**Lagret** (hur många som finns kvar) ligger däremot i databasen Supabase. Se [08](08-supabase-lager.md).
Öppna den i VS Code. Varje poster ser ut så här:

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

> **Regler så att inget går sönder**
> - Text ska stå inom citattecken: `"Catsuit"`. Siffror ska *inte* ha citattecken: `30`.
> - Varje rad slutar med kommatecken `,`.
> - Varje poster börjar med `{` och slutar med `},`.
> - Behöver texten innehålla `"`, skriv `\"` istället.
> - Om sidan visar ett rött felmeddelande efter en ändring har du troligen tappat ett komma eller citattecken. Titta på raden som felet pekar på.

## Ändra pris, namn, storlek eller beskrivning
Ändra värdet och spara (⌘ + S). Om `npm run dev` är igång syns ändringen direkt på localhost.
På internet syns den efter att du publicerat igen (se [06](06-publicera-pa-internet.md)).

## Lagret och "Sold out"
Lagret räknas ner automatiskt vid varje köp. Vill du ändra det för hand, till exempel när du fyllt på eller vill markera en poster som slutsåld (0), gör du det i Supabase. Se [08](08-supabase-lager.md).

## Ta bort en poster helt
Radera allt från `{` till och med `},` för den postern. Raden i Supabase kan ligga kvar, den gör ingen skada.

## Ändra ordningen i butiken
Postrarna visas i samma ordning som i filen. Flytta ett helt `{ … },`-block uppåt eller nedåt.

## Lägg till en ny poster
1. **Förbered bilden.** Den bör vara högst cirka 1600 pixlar på längsta sidan och en `.jpg`. På Mac: öppna bilden i Förhandsvisning → Verktyg → Justera storlek. Eller i Terminal:
   ```
   sips -Z 1600 "sökväg/till/bild.jpg" --out public/images/products/nytt-namn-1.jpg
   ```
2. **Lägg bilden** i `public/images/products/`. Använd bara små bokstäver, siffror och bindestreck i filnamnet (inga mellanslag eller å/ä/ö).
3. **Kopiera ett befintligt `{ … },`-block** i `products.js` och klistra in det där du vill ha den nya postern.
4. **Ändra alla värden.** `slug` måste vara unik, till exempel `"blue-cat"`.
5. **Lägg till postern i Supabase** med samma `slug` och antalet i lager (se [08](08-supabase-lager.md)). Annars visas den som "Sold out".
6. Spara och kolla på localhost.

Den första bilden i `images` visas i butikens rutnät. Övriga visas som små bilder på produktsidan.

## Gå igenom platshållarna (TODO)
När sidan byggdes hade bara tre posters riktigt namn, pris och storlek. Allt annat är gissat och markerat med `// TODO`.
Sök efter **TODO** i VS Code (⌘ + Shift + F) för att hitta alla. Ta bort `// TODO` när raden stämmer.

## Andra saker du kan ändra

| Vad | Var |
|---|---|
| Mejl, Instagram-länk, About-texten | `data/site.js` |
| Fraktpriser och leveranstider | `lib/shipping.js` (`price` och `deliveryText`) |
| Porträtten på About | Byt bilderna i `public/images/artist/` (behåll filnamnen) |
| Färger | Överst i `app/globals.css`, under `:root` |
| Texten i den rullande remsan | `app/layout.js`, raden med `<Marquee text="…" />` |
| Rubriken på startsidan | `app/page.js` |
| Texten under "Add to cart" (om riso och ram) | `app/shop/[slug]/page.js` |
| Max antal av samma poster per köp (nu 10) | `lib/limits.js` |
