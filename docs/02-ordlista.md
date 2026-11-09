# 2. Ordlista – tekniska ord förklarade enkelt

**Hemsida / webbsida**
Text, bilder och kod som en webbläsare (Chrome, Safari …) visar.

**HTML**
Språket som beskriver *vad* som finns på en sida: rubriker, bilder, knappar.

**CSS**
Språket som beskriver *hur* det ser ut: färger, storlekar, typsnitt. Hos oss finns all CSS i `app/globals.css`.

**JavaScript (JS)**
Programspråket som gör sidan interaktiv, till exempel att varukorgen räknar upp när du klickar. Alla `.js`-filer i projektet är JavaScript.

**React**
Ett verktyg (bibliotek) för att bygga sidor av små återanvändbara **komponenter**. En komponent är en byggkloss, till exempel "ett produktkort". Vi skriver komponenten en gång och använder den 24 gånger, en per poster.

**JSX**
Det som ser ut som HTML inne i JavaScript-filerna, till exempel `<h1>{product.title}</h1>`. `{ }` betyder "stoppa in värdet av det här".

**Next.js**
Ett ramverk byggt ovanpå React. Det sköter sådant React inte gör själv:
- **Sidor från mappar.** Filen `app/about/page.js` blir automatiskt adressen `/about`.
- **Server.** Viss kod körs på en server istället för hos besökaren, till exempel kassan, som har en hemlig nyckel.
- **Bilder.** Bilderna görs automatiskt mindre och snabbare (komponenten `<Image>`).
- **Snabbhet.** Sidorna byggs i förväg så de laddar snabbt.

**Server / klient**
- *Klienten* är besökarens webbläsare. Allt som körs där kan besökaren se och ändra.
- *Servern* är datorn som skickar ut sidan. Det som körs där är dolt för besökaren.

Filer som börjar med `"use client"` körs i webbläsaren. Övriga körs på servern.

**API / API-route**
En adress som program pratar med istället för människor. `app/api/checkout/route.js` är vår API-route: varukorgen skickar dit vad kunden vill köpa, och får tillbaka en länk till Stripes betalsida.

**Stripe**
Ett företag som hanterar kortbetalningar. Vi skickar kunden till Stripe, kunden betalar där, och Stripe skickar tillbaka kunden till vår tack-sida.

**Stripe Checkout / Checkout Session**
Stripes färdiga betalsida. En "session" är ett enskilt köptillfälle.

**Testläge / live-läge (Stripe)**
I testläge är pengarna låtsas, och man betalar med testkortet 4242 4242 4242 4242. I live-läge är det riktiga pengar.

**Miljövariabel / `.env.local`**
En hemlig inställning som inte ska finnas i koden, till exempel Stripe-nyckeln. Den sparas i filen `.env.local`, som aldrig laddas upp någonstans.

**Node.js**
Programmet som kör JavaScript på din dator (utanför webbläsaren). Krävs för Next.js.

**npm**
Följer med Node.js. Laddar ner bibliotek (React, Next, Stripe) och kör kommandon:
- `npm install`: ladda ner allt som står i `package.json`
- `npm run dev`: starta sidan på din dator för att jobba med den
- `npm run build`: bygg en färdig version (görs automatiskt när sidan publiceras)

**`package.json`**
En lista över vilka bibliotek projektet använder, och vilka kommandon som finns.

**`node_modules/`**
Mappen där `npm install` lägger alla nedladdade bibliotek. Den är stor och kan alltid laddas ner igen, så du rör den aldrig och den följer inte med vid publicering.

**localhost**
"Den här datorn". `http://localhost:3000` är sidan som körs på din egen dator. Bara du kan se den.

**localStorage**
En liten lagringsplats i webbläsaren. Varukorgen sparas där, så den finns kvar om man stänger fliken.

**Slug**
Den korta delen av en adress som identifierar något, till exempel `catsuit` i `/shop/catsuit`.

**Deploy / publicera / hosting**
Att lägga ut sidan på internet. **Vercel** är ett företag (skapat av samma folk som gjort Next.js) där det är gratis och enkelt. Se [06-publicera-pa-internet.md](06-publicera-pa-internet.md).

**Git / GitHub**
Git sparar "versioner" av koden så man kan gå tillbaka. GitHub är en webbplats där man lagrar koden. Vercel kan hämta koden därifrån.

**TODO**
Programmerarslang för "att göra". Sök efter `TODO` i koden för att hitta det som återstår.

**Terminal**
Programmet där man skriver kommandon som text. På Mac: ⌘ + mellanslag, skriv "Terminal".
