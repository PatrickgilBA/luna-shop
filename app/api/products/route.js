// ============================================================================
//  THE PRINTS FOR THE BROWSER  (address: /api/products)
// ============================================================================
//  The cart (components/CartContext.js) gets every print from here:
//  name, price, image and stock. Then it can show the cart and make sure
//  the customer doesn't add more than there are.
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
