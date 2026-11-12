// ============================================================================
//  "YOU MAY ALSO LIKE" – which prints to show under a product page
// ============================================================================
//  Takes the prints that come after this one in the shop's order (and starts
//  over from the top when the list ends), so every page shows different
//  neighbours. Prints in stock come first; sold-out ones only fill up the row.
// ============================================================================

export function pickRelated(products, slug, count = 4) {
  const start = products.findIndex((product) => product.slug === slug);
  const others = [...products.slice(start + 1), ...products.slice(0, Math.max(start, 0))].filter(
    (product) => product.slug !== slug,
  );
  const inStock = others.filter((product) => product.stock > 0);
  const soldOut = others.filter((product) => product.stock <= 0);
  return [...inStock, ...soldOut].slice(0, count);
}
