# 1. Krav från intervjun

Innan något byggdes gjorde vi en kort intervju (8 oktober 2026). Här är svaren, och vad varje svar betydde för hur sidan byggdes.

## Grundkrav (från första meddelandet)

| Krav | Hur det löstes |
|---|---|
| En hemsida som säljer posters | En webbshop med varukorg och kortbetalning |
| Lik junioneda.com och eglezvirblyte.com | Samma upplägg: konstverken i ett rutnät på startsidan, en egen sida per verk och en enkel About-sida. Lite text, bilderna i fokus |
| Byggd med React och Next.js | Next.js 16 och React 19 (de senaste versionerna i oktober 2026) |
| Bilder från "Riso print" och "Artist intro pic" | Förminskade kopior ligger i `public/images/`. Originalen är orörda |
| Dokumentera allt, förklarat enkelt | Den här mappen `docs/`, plus kommentarer på svenska i koden |

## Intervjufrågor och svar

### Hur ska kunderna betala?
**Svar: Stripe-kassa.**
Kunden klickar "Checkout" och skickas till en säker betalsida hos Stripe. Där kan man betala med kort, Apple Pay eller Google Pay. Pengarna hamnar på Lunas Stripe-konto.
*Varför Stripe:* Vi behöver aldrig själva hantera kortnummer (det är både svårt och reglerat), och det kostar inget i månadsavgift, bara en liten avgift per köp.

### Vilket språk?
**Svar: Engelska.**
Alla texter som besökaren ser är på engelska. Kommentarerna i koden och dokumentationen är på svenska, eftersom de är till dig.

### Vilka sidor?
**Svar: Shop och About.**
- **Shop** är startsidan (`/`): alla posters i ett rutnät. Varje poster har en egen sida (`/shop/namn`).
- **About** (`/about`): text om Luna och fyra porträtt.
- Dessutom finns sidor som en butik måste ha: varukorg (`/cart`), tack-sida efter köp (`/success`) och en "sidan finns inte"-sida.
- Kontakt (mejl och Instagram) ligger i sidfoten och på About istället för på en egen sida.

### Vad heter konstnären/butiken?
**Svar: Luna.**

### Produktinformation för bilder utan namn eller pris?
**Svar: Platshållare.**
Bara tre bilder hade namn, storlek och pris i filnamnet:
- Catsuit, A4, 30 €
- Greetings Friends, A3, 35 €
- Protector, A5, 14 €

Några hade bara namn (Tiger, Free as a Bird, Flower Pot, Butterflyman, Grid and Weave, Seasons of Change). Resten hette bara `DSC_1689` eller liknande. Jag hittade på namn efter vad bilderna föreställer, gissade storlek och pris och markerade allt osäkert med `// TODO` i `data/products.js`.
**Luna måste gå igenom och rätta dessa.** Se [04-andra-produkter.md](04-andra-produkter.md).

### Vart ska posters skickas?
**Svar: Hela världen.**
I varukorgen väljer kunden mellan två fraktzoner:
- **EU**: billigare (platshållare 6 €)
- **Resten av världen**: dyrare (platshållare 15 €)

Stripe låter sedan bara kunden skriva en adress i den zon hen valde, så ingen kan välja EU-frakt och skicka till USA. Frakten kostar lika mycket oavsett hur många posters man köper. Priserna ändras i `lib/shipping.js`.

### Begränsat antal (lager)?
**Svar: Ja, visa "Sold out".**
Varje poster har ett `stock`-tal. När det är 0 står det "Sold out" och man kan inte köpa den. Kunden kan inte heller lägga fler i varukorgen än vad som finns.

*Tillägg 9 november 2026:* lagret ligger nu i databasen Supabase och räknas ner automatiskt vid köp (se [08](08-supabase-lager.md)).
**Viktigt:** Lagret minskar *inte* automatiskt när någon köper. Efter varje försäljning måste du sänka siffran själv. Varför, och hur det kan automatiseras senare, står i [07-logg-och-att-gora.md](07-logg-och-att-gora.md).

### Vilken stil?
**Svar: Färgglad och lekfull.**
- Färgerna är tagna från riktiga riso-bläck: fluorescerande rosa, blått, gult, grönt och orange.
- Rubriktypsnittet är *Bagel Fat One* (runt och bubbligt). Brödtexten är *DM Sans* (lättläst).
- Tjocka mörka kanter och "hårda" skuggor ger en tryckt, grafisk känsla.
- Korten i butiken får olika färg och lutar lite när man håller musen över dem.
- En rullande textremsa under menyn: "RISO PRINTS · MADE BY HAND · SHIPPING WORLDWIDE".
