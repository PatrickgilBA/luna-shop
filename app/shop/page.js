// ============================================================================
//  BUTIKEN  (adress: /shop)
// ============================================================================
//  Visar alla posters från data/products.js i ett rutnät.
//  Lagret ("Sold out") hämtas från Supabase (lib/inventory.js).
// ============================================================================

import products from "@/data/products";
import ProductCard from "@/components/ProductCard";
import site from "@/data/site";
import { getStock, withStock } from "@/lib/inventory";

export const metadata = { title: "Shop" };

export default async function ShopPage() {
  const stock = await getStock();

  return (
    <>
      <section className="shop-intro">
        <h1>Shop</h1>
        <p>
          {site.tagline}. Small editions, big colours.
          <br />
          {products.length} prints
        </p>
      </section>

      <section className="grid">
        {products.map((product) => (
          <ProductCard key={product.slug} product={withStock(product, stock)} />
        ))}
      </section>
    </>
  );
}
