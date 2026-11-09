// ============================================================================
//  LAGRET FÖR WEBBLÄSAREN  (adress: /api/stock)
// ============================================================================
//  Varukorgen (components/CartContext.js) hämtar lagret härifrån, så att
//  kunden inte kan lägga fler posters i varukorgen än det finns.
//  Svarar t.ex. { "catsuit": 10, "tiger": 3 }.
// ============================================================================

import { getStock } from "@/lib/inventory";

export async function GET() {
  try {
    return Response.json(await getStock());
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Could not load stock." }, { status: 500 });
  }
}
