# Luna – webbshop för riso-posters

**Börja läsa här.** Den här filen är startpunkten. Allt annat finns i mappen `docs/`.

Projektet byggdes **8 oktober 2026**. Det är en webbshop där konstnären Luna säljer sina
risograph-posters. Kunderna kan bläddra bland posters, lägga dem i en varukorg och betala med kort via Stripe.

Sidan är inspirerad av [junioneda.com](https://www.junioneda.com/) och
[eglezvirblyte.com](https://www.eglezvirblyte.com/), fast med en mer färgglad och lekfull stil.

---

## Dokumentationen (läs i den här ordningen)

| Fil | Vad den handlar om |
|---|---|
| [docs/01-krav-fran-intervjun.md](docs/01-krav-fran-intervjun.md) | Vad vi bestämde i intervjun, och varför |
| [docs/02-ordlista.md](docs/02-ordlista.md) | Förklaring av alla tekniska ord (React, Next, Stripe …) |
| [docs/03-hur-sidan-ar-byggd.md](docs/03-hur-sidan-ar-byggd.md) | Vilka filer som gör vad |
| [docs/04-andra-produkter.md](docs/04-andra-produkter.md) | **Den du behöver oftast:** byta pris, lägga till poster, markera slutsåld |
| [docs/05-stripe-betalning.md](docs/05-stripe-betalning.md) | Så kopplar du in betalningen |
| [docs/06-publicera-pa-internet.md](docs/06-publicera-pa-internet.md) | Så lägger du ut sidan på internet |
| [docs/07-logg-och-att-gora.md](docs/07-logg-och-att-gora.md) | Vad som är gjort, och vad som återstår |

---

## Snabbstart: visa sidan på din egen dator

Du behöver programmet **Node.js** (det fanns redan på datorn när vi började).

1. Öppna programmet **Terminal** (tryck ⌘ + mellanslag och skriv "Terminal").
2. Gå till projektmappen genom att skriva det här och trycka Enter:
   ```
   cd ~/Desktop/"Hemsida Luna 2"
   ```
3. **Bara första gången** (eller om mappen `node_modules` saknas):
   ```
   npm install
   ```
   Det laddar ner React, Next.js och Stripe, ungefär en minut.
4. Starta sidan:
   ```
   npm run dev
   ```
5. Öppna webbläsaren och gå till adressen som står i terminalen, oftast **http://localhost:3000**.
   Om ett annat projekt redan använder 3000 väljer Next själv till exempel 3001. Titta i terminalen.
6. Stäng av sidan genom att klicka i terminalen och trycka **Ctrl + C**.

Medan `npm run dev` är igång uppdateras sidan i webbläsaren direkt varje gång du sparar en fil.

---

## Mappen i korthet

```
Hemsida Luna 2/
├── README.md            ← den här filen
├── docs/                ← all dokumentation
├── data/
│   ├── products.js      ← ALLA POSTERS (namn, pris, bilder)
│   ├── home.js          ← bilderna på startsidan
│   └── site.js          ← mejl, Instagram, About-texten
├── lib/shipping.js      ← fraktpriser
├── lib/inventory.js     ← lagret, hämtas från Supabase (se docs/08)
├── supabase/setup.sql   ← så skapades databasen
├── app/                 ← sidorna (startsida, produktsida, About, varukorg …)
├── components/          ← byggklossar som används på flera sidor
├── public/images/       ← bilderna som visas på sidan (förminskade)
├── Riso print/          ← originalbilderna (rörs inte, används inte direkt)
├── Artist intro pic/    ← originalporträtten (rörs inte)
├── Batik/, IKEA/        ← fanns i mappen innan, används inte av sidan
└── .env.example         ← mall för hemliga nycklar (se docs/05)
```
