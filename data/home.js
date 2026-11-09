// ============================================================================
//  STARTSIDANS BILDER
// ============================================================================
//
//  Här bestämmer du vilka bilder som syns i rutnätet på startsidan.
//  Bilderna visas i samma ordning som i listan och pusslas ihop automatiskt.
//
//  Fälten betyder:
//
//    image   – bilden (ligger i public/images/)
//    video   – ELLER en video (ligger i public/videos/). Den spelar ljudlöst i loop.
//    poster  – för videor: en stillbild som visas medan videon laddar.
//    slug    – vilken poster bilden länkar till (samma slug som i products.js).
//              Utan slug länkar bilden till About-sidan.
//    caption – texten som syns när man håller musen över bilden.
//              Utan caption visas posterns namn.
//    size    – hur stor rutan är:
//                "small" = 1 ruta
//                "big"   = 2 × 2 rutor
//                "tall"  = 1 bred, 2 hög   (passar stående bilder)
//                "wide"  = 2 bred, 1 hög   (passar liggande bilder)
//
//  Bilderna och videorna beskärs för att fylla sin ruta. På dator är rutnätet 4 rutor
//  brett, på mobil 2.
// ============================================================================

const tiles = [
  // Överst: den roterande hunden (video) uppe till höger.
  { image: "/images/products/greetings-friends-1.jpg", slug: "greetings-friends", size: "big" },
  { video: "/videos/spotted-cat.mp4", poster: "/videos/spotted-cat.jpg", slug: "spotted-cat", size: "wide" },
  { image: "/images/products/tiger-1.jpg", slug: "tiger", size: "small" },
  { image: "/images/products/red-cat-1.jpg", slug: "red-cat", size: "small" },

  { image: "/images/products/butterflyman-1.jpg", slug: "butterflyman", size: "big" },
  { image: "/images/products/fire-horse-1.jpg", slug: "fire-horse", size: "tall" },
  { image: "/images/products/moon-cats-1.jpg", slug: "moon-cats", size: "small" },
  { image: "/images/products/catsuit-1.jpg", slug: "catsuit", size: "small" },

  // I mitten: ormen (video).
  { image: "/images/artist/luna-3.jpg", caption: "About Luna", size: "tall" },
  { image: "/images/products/flower-friends-1.jpg", slug: "flower-friends", size: "small" },
  { video: "/videos/snake.mp4", poster: "/videos/snake.jpg", caption: "Animation by Luna", size: "big" },
  { image: "/images/products/night-garden-1.jpg", slug: "night-garden", size: "small" },

  { image: "/images/artist/luna-4.jpg", caption: "About Luna", size: "wide" },
  { image: "/images/products/resting-dog-1.jpg", slug: "resting-dog", size: "wide" },

  // Längst ner: den blå figuren och tulpanen (videor).
  { image: "/images/products/seasons-of-change-1.jpg", slug: "seasons-of-change", size: "big" },
  { video: "/videos/blue-creature.mp4", poster: "/videos/blue-creature.jpg", caption: "Animation by Luna", size: "tall" },
  { image: "/images/products/sun-hug-1.jpg", slug: "sun-hug", size: "tall" },
  { video: "/videos/tulip-vase.mp4", poster: "/videos/tulip-vase.jpg", caption: "Animation by Luna", size: "small" },
  { image: "/images/products/flower-pot-1.jpg", slug: "flower-pot", size: "small" },
  { image: "/images/products/protector-3.jpg", slug: "protector", size: "small" },
  { image: "/images/products/moth-1.jpg", slug: "moth", size: "small" },
];

export default tiles;
