# 3. Hur sidan är byggd

## Sidorna och vilken fil som gör dem

I Next.js bestämmer **mappar i `app/`** vilka adresser som finns. Filen som heter `page.js` är själva sidan.

| Adress | Fil | Vad den visar |
|---|---|---|
| `/` | `app/page.js` | Startsidan. Stort namn, ett tätt rutnät av bilder och videor i olika storlekar (titeln syns när man håller musen över) och en länk in till butiken. Bilderna väljs i `data/home.js` |
| `/shop` | `app/shop/page.js` | Butiken. Alla posters i ett rutnät |
| `/shop/catsuit` (osv.) | `app/shop/[slug]/page.js` | En poster: bilder, pris, storlek, "Add to cart" |
| `/about` | `app/about/page.js` | Om Luna, med porträtt |
| `/cart` | `app/cart/page.js` | Varukorgen, val av frakt och "Checkout" |
| `/success` | `app/success/page.js` | "Thank you!" efter betalning |
| (fel adress) | `app/not-found.js` | "Oops! This page doesn't exist" |
| `/api/checkout` | `app/api/checkout/route.js` | Ingen sida. Kassan som pratar med Stripe |
| `/api/stripe-webhook` | `app/api/stripe-webhook/route.js` | Ingen sida. Stripe meddelar köp hit, och lagret räknas ner i Supabase |
| `/api/stock` | `app/api/stock/route.js` | Ingen sida. Ger varukorgen lagret från Supabase |

`[slug]` med hakparenteser betyder "vad som helst". En och samma fil används för alla 24 produktsidor.

## Ramen runt alla sidor

`app/layout.js` är ramen som syns på varje sida:

```
┌────────────────────────────────────────┐
│  Luna              Shop  About  Cart 2 │  ← components/Header.js
├────────────────────────────────────────┤
│  RISO PRINTS · MADE BY HAND · …  →→→   │  ← components/Marquee.js
├────────────────────────────────────────┤
│                                        │
│         (den aktuella sidan)           │  ← page.js-filerna
│                                        │
├────────────────────────────────────────┤
│  mejl · Instagram · © 2026 Luna        │  ← components/Footer.js
└────────────────────────────────────────┘
```

## Komponenterna (byggklossarna) i `components/`

| Fil | Vad den gör |
|---|---|
| `Header.js` | Logga och meny. Visar antal varor i varukorgen |
| `Footer.js` | Sidfoten |
| `Marquee.js` | Den rullande textremsan |
| `LoopingVideo.js` | En video som spelar ljudlöst i loop, i startsidans rutnät |
| `ProductCard.js` | Ett kort i butikens rutnät (bild, namn, pris, "Sold out") |
| `ProductGallery.js` | Stor bild plus små bilder att klicka på, på produktsidan |
| `AddToCartButton.js` | Knappen "Add to cart" |
| `CartContext.js` | **Varukorgens hjärna.** Kommer ihåg vad kunden valt och delar det med alla sidor |

## Data: informationen som visas

| Fil | Innehåll |
|---|---|
| `data/products.js` | Alla posters |
| `data/site.js` | Namn, mejl, Instagram, About-texten |
| `data/home.js` | Vilka bilder som syns i startsidans rutnät, och hur stora de är (small/big/tall/wide) |
| `lib/shipping.js` | Fraktzoner, priser och länder |
| `lib/inventory.js` | Hämtar lagret från Supabase och räknar ner det efter köp (se [08](08-supabase-lager.md)) |
| `lib/format.js` | Gör om 30 till "€30.00" |
| `app/globals.css` | All design (färger, typsnitt, storlekar) |

## Vad som händer när någon köper – steg för steg

```
 Kunden                    Vår sida                         Stripe
 ──────                    ────────                         ──────
 1. Klickar "Add to cart"
    → sparas i webbläsaren (CartContext + localStorage)

 2. Går till /cart, väljer EU eller World,
    klickar "Checkout"
                     ──→  3. /api/checkout (på servern):
                             • kollar att postrarna finns
                             • kollar att antalet ≤ lager (i Supabase)
                             • hämtar RÄTT pris från products.js
                             • ber Stripe skapa en betalsida   ──→  4. Skapar betalsidan
                     ←──────────────────────────────────────────────  och svarar med en länk
 5. Skickas till Stripes betalsida,
    fyller i adress och kort                                   ──→  6. Drar pengarna,
                                                                       mejlar kvitto
 7. Skickas tillbaka till /success
    → varukorgen töms
                                                                  8. Luna ser ordern i
                                                                     Stripe Dashboard och
                                                                     postar postern
```

**Varför kollar servern priset?** Allt som finns i webbläsaren kan en kunnig besökare ändra. Därför skickar webbläsaren bara *vilka* posters och *hur många*. Priset slås alltid upp på servern.

## Bilderna

- Originalen i `Riso print/` och `Artist intro pic/` var 289 MB, vissa över 8000 pixlar breda. Det är alldeles för stort för en webbsida.
- Förminskade kopior (max 1600 pixlar, totalt cirka 17 MB) ligger i `public/images/products/` och `public/images/artist/`.
- Next.js `<Image>` gör dem ännu mindre automatiskt, beroende på skärmens storlek.
- Allt i mappen `public/` går att nå på sidan. `public/images/products/catsuit-1.jpg` blir adressen `/images/products/catsuit-1.jpg`.

### Vilken originalbild blev vilken fil?

| Webbfil | Original i "Riso print" |
|---|---|
| catsuit-1 / -2 | Catsuit_A4_30 Euro… / DSC_1700_1 |
| flower-pot-1 / -2 / -3 | Flower pot_In medow / DSC_1701_1 / DSC_1707_2 |
| free-as-a-bird-1 / -2 | Free as a bird frame / DSC_1711_1 |
| greetings-friends-1 / -2 | Greetings freiens_A3… / DSC_1722_1 |
| protector-1 / -2 / -3 / -4 | Protector_A5…(2) / Protector_A5…(1) / Protector A3 room / Protector screen print |
| tiger-1 / -2 | Tiger in frame_Render / DSC_1715_1 |
| butterflyman-1 / -2 | butterflyman frame / DSC_1704_1 |
| grid-and-weave-1 / -2 | grid and weave in room / DSC_1720_1 |
| seasons-of-change-1 / -2 | seasons of change in chair remake / DSC_1697_1 |
| high-five-1 | DSC09808 |
| sun-hug-1 | DSC09820 |
| fire-horse-1 | DSC09838 |
| spotted-cat-1 | DSC_1579_1 |
| cat-and-bunny-1 | DSC_1689_1 |
| all-in-1 | DSC_1691_1 |
| resting-dog-1 | DSC_1692_1 |
| purple-flowers-1 | DSC_1694_1 |
| big-hug-1 | DSC_1702_2 |
| moon-cats-1 | PNP02851 |
| flower-friends-1 | PNP02877 |
| red-cat-1 | PNP02894 |
| dont-let-fear-1 | PNP02947 |
| night-garden-1 | PNP02978 |
| moth-1 | PNP02998 |

| Webbfil | Original i "Artist intro pic" |
|---|---|
| luna-1 (stor bild på About) | DSC_1735_1 |
| luna-2 | Luna_Artist pic |
| luna-3 | PNP03069 |
| luna-4 | 03092026-VANNI_03092026_85-52 |

Mapparna `Batik/` och `IKEA/` fanns redan i mappen men används inte av sidan.
