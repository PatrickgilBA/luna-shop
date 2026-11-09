// ============================================================================
//  ALLA POSTERS I BUTIKEN
// ============================================================================
//
//  Det här är den enda filen du behöver ändra för att:
//    - byta namn, pris, storlek eller beskrivning på en poster
//    - lägga till eller ta bort en poster
//
//  Läs docs/04-editing-products.md för en steg-för-steg-guide.
//
//  LAGRET (hur många som finns kvar) ligger INTE här, utan i databasen
//  Supabase, i tabellen "inventory". Där räknas det ner automatiskt vid köp.
//  En ny poster måste därför också läggas till där – se docs/08-supabase-stock.md.
//
//  Varje poster är ett "objekt" mellan { och }. Fälten betyder:
//
//    slug        – en kort ID som syns i webbadressen, t.ex. /shop/catsuit
//                  Bara små bokstäver, siffror och bindestreck. Måste vara unik.
//    title       – namnet som visas på sidan
//    size        – storleken som visas på sidan
//    price       – pris i euro (bara siffran, t.ex. 30)
//    images      – bilderna (ligger i public/images/products/).
//                  Den FÖRSTA bilden visas i butikens rutnät.
//    description – en kort text om postern
//
//  Rader med "TODO" är platshållare som Luna behöver kontrollera.
//  Bara Catsuit, Greetings Friends och Protector hade riktigt namn,
//  storlek och pris i filnamnet – resten är gissningar.
// ============================================================================

const products = [
  {
    slug: "catsuit",
    title: "Catsuit",
    size: "A4 (21 × 29.7 cm)",
    price: 30,
    images: ["/images/products/catsuit-1.jpg", "/images/products/catsuit-2.jpg"],
    description:
      "A very cool cat in a very blue suit. Risograph print on thick paper.",
  },
  {
    slug: "greetings-friends",
    title: "Greetings Friends",
    size: "A3 (29.7 × 42 cm)",
    price: 35,
    images: [
      "/images/products/greetings-friends-1.jpg",
      "/images/products/greetings-friends-2.jpg",
    ],
    description: "A crowded shelf of happy house plants. Risograph print.",
  },
  {
    slug: "protector",
    title: "Protector",
    size: "A5 (14.8 × 21 cm)",
    price: 14,
    images: [
      "/images/products/protector-1.jpg",
      "/images/products/protector-2.jpg",
      "/images/products/protector-3.jpg",
      "/images/products/protector-4.jpg",
    ],
    description: "A gentle giant keeping someone small safe. Risograph print.",
  },
  {
    slug: "tiger",
    title: "Tiger", // TODO: kontrollera namn
    size: "30 × 30 cm", // TODO: kontrollera storlek
    price: 35, // TODO: kontrollera pris
    images: ["/images/products/tiger-1.jpg", "/images/products/tiger-2.jpg"],
    description: "A striped tiger hiding among the flowers. Risograph print.", // TODO
  },
  {
    slug: "free-as-a-bird",
    title: "Free as a Bird",
    size: "A3 (29.7 × 42 cm)", // TODO
    price: 35, // TODO
    images: [
      "/images/products/free-as-a-bird-1.jpg",
      "/images/products/free-as-a-bird-2.jpg",
    ],
    description: "A black bird in a wild, colourful jungle. Risograph print.", // TODO
  },
  {
    slug: "flower-pot",
    title: "Flower Pot",
    size: "A4 (21 × 29.7 cm)", // TODO
    price: 30, // TODO
    images: [
      "/images/products/flower-pot-1.jpg",
      "/images/products/flower-pot-2.jpg",
      "/images/products/flower-pot-3.jpg",
    ],
    description: "A wobbly blue vase full of spring flowers. Risograph print.", // TODO
  },
  {
    slug: "butterflyman",
    title: "Butterflyman",
    size: "A4 (21 × 29.7 cm)", // TODO
    price: 30, // TODO
    images: [
      "/images/products/butterflyman-1.jpg",
      "/images/products/butterflyman-2.jpg",
    ],
    description: "Half human, half butterfly. Risograph print.", // TODO
  },
  {
    slug: "grid-and-weave",
    title: "Grid and Weave",
    size: "A3 (29.7 × 42 cm)", // TODO
    price: 35, // TODO
    images: [
      "/images/products/grid-and-weave-1.jpg",
      "/images/products/grid-and-weave-2.jpg",
    ],
    description: "Four colours woven together. Risograph print.", // TODO
  },
  {
    slug: "seasons-of-change",
    title: "Seasons of Change",
    size: "A4 (21 × 29.7 cm)", // TODO
    price: 30, // TODO
    images: [
      "/images/products/seasons-of-change-1.jpg",
      "/images/products/seasons-of-change-2.jpg",
    ],
    description: "A spotted creature with a flower on its back. Risograph print.", // TODO
  },
  {
    slug: "moon-cats",
    title: "Moon Cats", // TODO: kontrollera namn
    size: "A4 (21 × 29.7 cm)", // TODO
    price: 30, // TODO
    images: ["/images/products/moon-cats-1.jpg"],
    description: "Two cats cuddling under the moon. Risograph print.", // TODO
  },
  {
    slug: "flower-friends",
    title: "Flower Friends", // TODO
    size: "A4 (21 × 29.7 cm)", // TODO
    price: 30, // TODO
    images: ["/images/products/flower-friends-1.jpg"],
    description: "Three friends with flowers for heads. Risograph print.", // TODO
  },
  {
    slug: "red-cat",
    title: "Red Cat", // TODO
    size: "A4 (21 × 29.7 cm)", // TODO
    price: 30, // TODO
    images: ["/images/products/red-cat-1.jpg"],
    description: "A fluorescent red cat lounging on a branch. Risograph print.", // TODO
  },
  {
    slug: "dont-let-fear",
    title: "Don't Let Fear Control Your Body", // TODO
    size: "A4 (21 × 29.7 cm)", // TODO
    price: 30, // TODO
    images: ["/images/products/dont-let-fear-1.jpg"],
    description: "Friendly monsters with an important message. Risograph print.", // TODO
  },
  {
    slug: "night-garden",
    title: "Night Garden", // TODO
    size: "A4 (21 × 29.7 cm)", // TODO
    price: 30, // TODO
    images: ["/images/products/night-garden-1.jpg"],
    description: "A tiny figure in a garden glowing in the dark. Risograph print.", // TODO
  },
  {
    slug: "moth",
    title: "Moth", // TODO
    size: "A4 (21 × 29.7 cm)", // TODO
    price: 30, // TODO
    images: ["/images/products/moth-1.jpg"],
    description: "An orange moth flying through the clouds. Risograph print.", // TODO
  },
  {
    slug: "high-five",
    title: "High Five", // TODO
    size: "A5 (14.8 × 21 cm)", // TODO
    price: 14, // TODO
    images: ["/images/products/high-five-1.jpg"],
    description: "A cat and a leopard sharing a sunny high five. Risograph print.", // TODO
  },
  {
    slug: "sun-hug",
    title: "Sun Hug", // TODO
    size: "A5 (14.8 × 21 cm)", // TODO
    price: 14, // TODO
    images: ["/images/products/sun-hug-1.jpg"],
    description: "Night embracing the sun. Risograph print.", // TODO
  },
  {
    slug: "fire-horse",
    title: "Fire Horse", // TODO
    size: "A5 (14.8 × 21 cm)", // TODO
    price: 14, // TODO
    images: ["/images/products/fire-horse-1.jpg"],
    description: "A golden horse galloping through flames. Risograph print.", // TODO
  },
  {
    slug: "spotted-cat",
    title: "Spotted Cat", // TODO
    size: "A5 (14.8 × 21 cm)", // TODO
    price: 14, // TODO
    images: ["/images/products/spotted-cat-1.jpg"],
    description: "A polka-dot cat on a deep green background. Risograph print.", // TODO
  },
  {
    slug: "cat-and-bunny",
    title: "Cat and Bunny", // TODO
    size: "A5 (14.8 × 21 cm)", // TODO
    price: 14, // TODO
    images: ["/images/products/cat-and-bunny-1.jpg"],
    description: "Best friends out for a walk. Risograph print.", // TODO
  },
  {
    slug: "all-in",
    title: "All In!", // TODO
    size: "A5 (14.8 × 21 cm)", // TODO
    price: 14, // TODO
    images: ["/images/products/all-in-1.jpg"],
    description: "Cheers to going all in. Risograph print.", // TODO
  },
  {
    slug: "resting-dog",
    title: "Resting Dog", // TODO
    size: "A5 (14.8 × 21 cm)", // TODO
    price: 14, // TODO
    images: ["/images/products/resting-dog-1.jpg"],
    description: "A white dog taking a well-deserved rest. Risograph print.", // TODO
  },
  {
    slug: "purple-flowers",
    title: "Purple Flowers", // TODO
    size: "15 × 15 cm", // TODO
    price: 14, // TODO
    images: ["/images/products/purple-flowers-1.jpg"],
    description: "Lilac blooms on a dark background. Risograph print.", // TODO
  },
  {
    slug: "big-hug",
    title: "Big Hug", // TODO
    size: "A5 (14.8 × 21 cm)", // TODO
    price: 14, // TODO
    images: ["/images/products/big-hug-1.jpg"],
    description: "Two flower people in a warm embrace. Risograph print.", // TODO
  },
];

export default products;

// Hjälpfunktion: hitta en poster utifrån dess slug (används av produktsidan).
export function getProduct(slug) {
  return products.find((product) => product.slug === slug);
}
