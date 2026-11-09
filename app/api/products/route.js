// ============================================================================
//  PRODUKTERNA FÖR WEBBLÄSAREN  (adress: /api/products)
// ============================================================================
//  Varukorgen (components/CartContext.js) hämtar alla posters härifrån:
//  namn, pris, bild och lager. Då kan den visa varukorgen och se till att
//  kunden inte lägger i fler än det finns.
// ============================================================================

import { getProducts } from "@/lib/products";

export async function GET() {
  try {
    return Response.json(await getProducts());
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Could not load the products." }, { status: 500 });
  }
}
