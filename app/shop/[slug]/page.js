// ============================================================================
//  PRODUKTSIDA  (adress: /shop/catsuit, /shop/tiger, ...)
// ============================================================================
//  [slug] i mappnamnet betyder att den här filen används för ALLA posters.
//  Next.js skickar in slug:en från adressen, och vi letar upp rätt poster.
// ============================================================================

import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { SHIPPING_ZONES } from "@/lib/shipping";
import { getProducts, getProduct } from "@/lib/products";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";

// Säger åt Next.js vilka produktsidor som finns, så de kan byggas i förväg (snabbare).
// Nya posters som läggs till senare byggs första gången någon besöker dem.
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

// Titeln i webbläsarfliken, t.ex. "Catsuit – Luna".
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description,
    openGraph: { images: [product.images[0]] },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug); // från Supabase, med lagret
  if (!product) notFound(); // Visar 404-sidan om postern inte finns.

  return (
    <article className="product">
      <ProductGallery images={product.images} title={product.title} />

      <div className="product-info">
        <Link href="/shop" className="small-link">
          ← Back to shop
        </Link>
        <h1>{product.title}</h1>
        <p className="price">{formatPrice(product.price)}</p>
        <p>{product.description}</p>

        <dl className="details">
          <dt>Size</dt>
          <dd>{product.size}</dd>
          <dt>Technique</dt>
          <dd>Risograph print</dd>
          <dt>Shipping</dt>
          <dd>
            EU {formatPrice(SHIPPING_ZONES.eu.price)} · Worldwide{" "}
            {formatPrice(SHIPPING_ZONES.world.price)}
          </dd>
        </dl>

        <AddToCartButton product={product} />

        <p className="note">
          Every riso print is printed by hand, layer by layer, so small variations in colour
          and texture are part of the charm. Frame not included.
        </p>
      </div>
    </article>
  );
}
