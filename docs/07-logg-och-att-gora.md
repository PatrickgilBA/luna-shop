# 7. Logg och att göra

## Logg

### 9 november 2026 – kontaktuppgifter och mindre namn
- Lunas riktiga mejl (lunamarinagil@gmail.com) och Instagram (@lunamarinagil) lades in i `data/site.js`. De visas i sidfoten och på About-sidan.
- Namnet "Luna" på startsidan gjordes ungefär hälften så stort.

### 9 november 2026 – välj antal på produktsidan
- Produktsidan har en antalsväljare (− 1 +) bredvid "Add to cart" (`components/AddToCartButton.js`).
- Man kan som mest ha **10 av samma poster** i ett köp. Siffran står i `lib/limits.js` och gäller produktsidan, varukorgen och kassan på servern. Finns det färre i lager blir lagret gränsen.
- **Testat:** `npm run build` utan fel. I webbläsaren: lade 5 i varukorgen, kunde sedan bara lägga till 5 till. Knappen visade "Max 10 per print". Kassan nekar 11 st.

### 9 november 2026 – lagret räknas ner även utan webhook
- Tack-sidan skickar köpets id till nya `/api/confirm-order`. Servern frågar Stripe om köpet är betalt och räknar i så fall ner lagret. Det fungerar lokalt utan Stripe CLI, till exempel för en redovisning.
- Koden som räknar ner lagret flyttades till `lib/orders.js` och används av både tack-sidan och webhooken. Köpet räknas bara en gång även om båda körs.
- Knappen "Back to the shop" på tack-sidan laddar om butiken helt, så att det nya lagret syns direkt.
- **Testat:** `npm run build` utan fel. Ett riktigt testköp i webbläsaren av 10 *Moth* med kortet 4242 på Stripes betalsida: lagret i Supabase gick från 10 till 0 och produktsidan visade "Sold out" direkt. Lagret återställdes efteråt.

### 9 november 2026 – videor på startsidan
- Fyra animationer från mappen `Videor Luna/` lades i `public/videos/` med läsbara namn: `blue-creature`, `tulip-vase`, `snake` och `spotted-cat`. Originalen ligger kvar orörda.
- `spotted-cat.mp4` gjordes mindre med Macens `avconvert`, från 9 MB till 3,3 MB (640 × 420 pixlar). De andra var redan små.
- Varje video har en stillbild (`.jpg`) som visas medan den laddar.
- I startsidans rutnät (`data/home.js`) spelar videorna ljudlöst i loop, i samma sorts rutor som bilderna. Den prickiga kattens video ersatte stillbilden av samma poster. Ormen, den blå figuren och tulpanen fick nya rutor, tillsammans med bilden *Flower Friends*.
- Videorna spreds sedan ut över sidan: den roterande hunden högst upp till höger, ormen i mitten, den blå figuren och tulpanen längst ner.
- Ny komponent: `components/LoopingVideo.js`. Videon står still för besökare som stängt av animationer i sin dator.
- **Testat:** `npm run build` utan fel, och skärmdumpar på dator (1440 px) och mobil (390 px). Rutnätet har inga hål.

### 9 november 2026 – lagret i Supabase
- Ett Supabase-projekt skapades och databasen sattes upp med `supabase/setup.sql`: tabellen `inventory` (lagret), tabellen `processed_orders` och funktionen `process_order`. Row Level Security är på, så besökare får bara läsa lagret.
- `stock` togs bort ur `data/products.js`. Lagret hämtas nu från Supabase (`lib/inventory.js`). Butiken och produktsidorna uppdateras minst en gång i minuten, och direkt efter ett köp.
- Kassan kontrollerar lagret i Supabase innan betalningen. Varukorgen hämtar lagret via `/api/stock`.
- Ny Stripe-webhook, `/api/stripe-webhook`, räknar ner lagret när ett köp är betalt. Samma köp räknas aldrig två gånger.
- Inga nya paket. Supabase anropas med vanlig `fetch`.
- **Testat:**
  - `npm run build` utan fel.
  - Den publika nyckeln kan läsa lagret men inte ändra det eller köra `process_order`.
  - Kassan nekar när man vill köpa fler än som finns, och när en poster är slutsåld.
  - Webhooken nekar meddelanden utan Stripe-signatur.
  - Hela kedjan med en riktig betalsida i Stripes testläge och ett signerat "betalt"-meddelande: lagret gick från 10 till 9 och syntes direkt på sidan, och ett upprepat meddelande räknades inte igen. Allt återställdes efteråt.
- **Inte testat än:** ett köp där Stripe själv skickar webhooken. Tack-sidan räknar ner lagret även utan den, se loggen ovan. Det kräver Stripe CLI eller att sidan ligger på internet (se [08](08-supabase-lager.md)).
- **Säkerhet:** `npm audit` visar att Next.js 16.4.0 har kända allvarliga säkerhetshål. 16.4.5 rättar dem. Inte uppgraderat än.

### 22 oktober 2026 – nytt utseende
- Inspiration: konstnärsportfolios som [eglezvirblyte.com](https://www.eglezvirblyte.com/) och en Readymag-sida av Nikita Lukyanov.
- **Ny startsida** (`app/page.js`): stort namn med svävande bilder, en kort presentation, ett kollage med bilder i olika storlekar och en stor länk "Enter the shop". Bilderna och deras placering ändras i `data/home.js`.
- **Butiken flyttade** från `/` till `/shop` (`app/shop/page.js`). Alla länkar ("Back to shop" osv.) pekar dit.
- **Nytt utseende överallt** (`app/globals.css`): ljust papper, mycket luft, inga tjocka ramar eller skuggor. Rubriker i typsnittet *Ultra*, riso-blått som accentfärg.
- `priority` på bilder byttes mot `preload` (`priority` är avvecklat i Next.js 16).
- Funktionerna (varukorg, lager, Stripe-kassan) är inte ändrade.
- Kollaget gjordes tätare: varje rad fyller hela bredden, mindre avstånd mellan raderna och mindre förskjutning nedåt.
- Startsidan gjordes om igen, mer lik eglezvirblyte.com: inga bilder över namnet längre, och kollaget ersattes av ett tätt rutnät (4 kolumner på dator, 2 på mobil) med rutor i fyra storlekar och smala mellanrum. Titeln visas i en blå ruta när man håller musen över en bild. Den blå rullande randen behölls.
- **Testat:** `npm run build` utan fel. Skärmdumpar av startsida, butik, produktsida och About på dator (1440 px) samt startsidan på mobil (390 px).

### 8 oktober 2026 – första versionen
- Intervju om kraven (se [01](01-krav-fran-intervjun.md)).
- Projektet skapades med **Next.js 16.4, React 19.3 och Stripe 23** (`package.json`).
- Koden skrevs i vanlig JavaScript, inte TypeScript, för att vara lättare att läsa för en nybörjare.
- 36 produktbilder och 4 porträtt förminskades från 289 MB till cirka 17 MB med Macens inbyggda verktyg `sips`.
- 24 posters identifierades från bilderna och lades in i `data/products.js`. 21 av dem har platshållare (TODO).
- Sidor byggda: butik, produktsida, About, varukorg, tack-sida, 404.
- Kassan med Stripe Checkout byggdes, med två fraktzoner (EU / resten av världen).
- **Testat:**
  - `npm run build` går igenom utan fel.
  - Alla sidor har kontrollerats med skärmdumpar på dator och mobil (375 px bred).
  - Kassan avvisar: för många exemplar, posters som inte finns, negativt antal, tom varukorg och okänd fraktzon.
  - Landslistan i `lib/shipping.js` är kontrollerad mot Stripes lista över tillåtna länder.
- **Inte testat än:** ett riktigt köp hela vägen genom Stripe, eftersom det kräver Lunas Stripe-nyckel. Gör steg 4 i [05](05-stripe-betalning.md) först av allt när nyckeln finns.

## Att göra

### Måste göras innan sidan öppnar
- [ ] Gå igenom alla `TODO` i `data/products.js`: namn, storlek och pris. Rätt lager sätts i Supabase.
- [ ] Uppgradera Next.js till 16.4.5 eller senare (säkerhetshål i 16.4.0).
- [ ] Koppla in Stripe-webhooken och lägg in Supabase-nycklarna på Vercel ([08](08-supabase-lager.md)).
- [ ] Skapa nya Supabase-nycklar (de nuvarande skickades i en chatt) och byt i `.env.local`.
- [x] Riktigt mejl och Instagram i `data/site.js`.
- [ ] Riktig About-text i `data/site.js`.
- [ ] Riktiga fraktpriser i `lib/shipping.js`.
- [ ] Skapa Stripe-konto och testa ett köp med testkortet ([05](05-stripe-betalning.md)).
- [ ] Publicera på Vercel ([06](06-publicera-pa-internet.md)).
- [ ] Byt till Stripe live-nyckel.
- [ ] Kontrollera regler för moms och skatt.

### Idéer till senare
- ~~**Automatiskt lager.**~~ Klart 9 november 2026, se [08](08-supabase-lager.md).
- **Fri frakt över ett visst belopp**, till exempel "Free shipping over €60".
- **Fler fraktzoner**, till exempel en egen för Sverige/Norden.
- **Kontaktformulär** eller nyhetsbrev.
- **Kategorier eller filter** (A3 / A4 / A5) om det blir många posters.
- **Svenska som andra språk.**
- **Lägg ut koden på git/GitHub** så att varje ändring sparas som en version. Behövs ändå för Vercel.
