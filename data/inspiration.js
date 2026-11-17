// ============================================================================
//  THE INSPIRATION PAGE IMAGES  (address: /inspiration)
// ============================================================================
//
//  Works just like data/home.js: the images are shown in the same order as
//  in the list, and fitted together in a grid 4 tiles wide (2 on a phone).
//
//    image – the image (in public/images/inspiration/)
//    alt   – a short description, read aloud by screen readers
//    size  – "small" = 1 tile · "tall" = 1 wide, 2 high · "big" = 2 × 2
//            · "wide" = 2 wide, 1 high
//
//  The sizes must add up to whole rows: small = 1, tall/wide = 2, big = 4,
//  and the total must divide by 4 (a test checks this).
// ============================================================================

const inspiration = [
  // Two rows: a big image, a tall one, and two small ones on top of each other.
  { image: "/images/inspiration/inspo-01.jpg", alt: "A living room with a white sofa and two of Luna's prints on the wall", size: "big" },
  { image: "/images/inspiration/inspo-02.jpg", alt: "A grey shelf with plants and books, and a print in a red frame", size: "tall" },
  { image: "/images/inspiration/inspo-03.jpg", alt: "A bedroom with striped bedding and a colourful print above the bed", size: "small" },
  { image: "/images/inspiration/inspo-04.jpg", alt: "A hallway with a black cat print in a purple frame", size: "small" },

  // Two rows: tall, big, tall.
  { image: "/images/inspiration/inspo-05.jpg", alt: "A dining room with a wall of colourful prints over a blue table", size: "tall" },
  { image: "/images/inspiration/inspo-06.jpg", alt: "A green kitchen counter with an orange coffee maker under a print", size: "big" },
  { image: "/images/inspiration/inspo-07.jpg", alt: "A green bookshelf under two framed prints", size: "tall" },

  // Two rows: tall, two small ones, big.
  { image: "/images/inspiration/inspo-09.jpg", alt: "A doorway into a dining room, with two prints on the wall beside it", size: "tall" },
  { image: "/images/inspiration/inspo-08.jpg", alt: "A bed with a blue cover under two framed prints", size: "small" },
  { image: "/images/inspiration/inspo-10.jpg", alt: "A bright room with a stack of books and a print of two figures", size: "big" },
  { image: "/images/inspiration/inspo-11.jpg", alt: "A green sofa and an armchair with two framed prints above", size: "small" },
];

export default inspiration;
