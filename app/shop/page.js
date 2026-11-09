// ============================================================================
//  BUTIKEN  (adress: /shop)
// ============================================================================
//  Visar alla posters i ett rutnät. De hämtas från Supabase (lib/products.js).
// ============================================================================

import ProductCard from "@/components/ProductCard";
import site from "@/data/site";
import { getProducts } from "@/lib/products";

export const metadata = { title: "Shop" };

export default async function ShopPage() {
  const products = await getProducts();

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
          <ProductCard key={product.slug} product={product} />
        ))}
      </section>
    </>
  );
}
