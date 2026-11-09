// ============================================================================
//  THE LANDING PAGE IMAGES
// ============================================================================
//
//  Here you decide which images are shown in the landing page grid.
//  They are shown in the same order as in the list, and fitted together automatically.
//
//  The fields mean:
//
//    image   – the image (in public/images/)
//    video   – OR a video (in public/videos/). It plays silently on a loop.
//    poster  – for videos: a still image shown while the video loads.
//    slug    – which print the image links to (its slug in Supabase).
//              Without a slug, the image links to the About page.
//    caption – the text shown when you hover over the image.
//              Without a caption, the print's name is shown.
//    size    – how big the tile is:
//                "small" = 1 tile
//                "big"   = 2 × 2 tiles
//                "tall"  = 1 wide, 2 high   (suits portrait images)
//                "wide"  = 2 wide, 1 high   (suits landscape images)
//
//  Images and videos are cropped to fill their tile. On a computer the grid is 4 tiles
//  wide, on a phone 2.
// ============================================================================

const tiles = [
  // At the top: the spinning dog (video), top right.
  { image: "/images/products/greetings-friends-1.jpg", slug: "greetings-friends", size: "big" },
  { video: "/videos/spotted-cat.mp4", poster: "/videos/spotted-cat.jpg", slug: "spotted-cat", size: "wide" },
  { image: "/images/products/tiger-1.jpg", slug: "tiger", size: "small" },
  { image: "/images/products/red-cat-1.jpg", slug: "red-cat", size: "small" },

  { image: "/images/products/butterflyman-1.jpg", slug: "butterflyman", size: "big" },
  { image: "/images/products/fire-horse-1.jpg", slug: "fire-horse", size: "tall" },
  { image: "/images/products/moon-cats-1.jpg", slug: "moon-cats", size: "small" },
  { image: "/images/products/catsuit-1.jpg", slug: "catsuit", size: "small" },

  // In the middle: the snake (video).
  { image: "/images/artist/luna-3.jpg", caption: "About Luna", size: "tall" },
  { image: "/images/products/flower-friends-1.jpg", slug: "flower-friends", size: "small" },
  { video: "/videos/snake.mp4", poster: "/videos/snake.jpg", caption: "Animation by Luna", size: "big" },
  { image: "/images/products/night-garden-1.jpg", slug: "night-garden", size: "small" },

  { image: "/images/artist/luna-4.jpg", caption: "About Luna", size: "wide" },
  { image: "/images/products/resting-dog-1.jpg", slug: "resting-dog", size: "wide" },

  // At the bottom: the blue creature and the tulip (videos).
  { image: "/images/products/seasons-of-change-1.jpg", slug: "seasons-of-change", size: "big" },
  { video: "/videos/blue-creature.mp4", poster: "/videos/blue-creature.jpg", caption: "Animation by Luna", size: "tall" },
  { image: "/images/products/sun-hug-1.jpg", slug: "sun-hug", size: "tall" },
  { video: "/videos/tulip-vase.mp4", poster: "/videos/tulip-vase.jpg", caption: "Animation by Luna", size: "small" },
  { image: "/images/products/flower-pot-1.jpg", slug: "flower-pot", size: "small" },
  { image: "/images/products/protector-3.jpg", slug: "protector", size: "small" },
  { image: "/images/products/moth-1.jpg", slug: "moth", size: "small" },
];

export default tiles;
