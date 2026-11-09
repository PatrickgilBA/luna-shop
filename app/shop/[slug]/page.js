// ============================================================================
//  PRODUCT PAGE  (address: /shop/catsuit, /shop/tiger, ...)
// ============================================================================
//  [slug] in the folder name means this one file is used for ALL prints.
//  Next.js passes in the slug from the address, and we look up the right print.
// ============================================================================

import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { SHIPPING_ZONES } from "@/lib/shipping";
import { getProducts, getProduct } from "@/lib/products";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";

// Tells Next.js which product pages exist, so they can be built in advance (faster).
// New prints added later are built the first time someone visits them.
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

// The title in the browser tab, e.g. "Catsuit – Luna".
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
  const product = await getProduct(slug); // from Supabase, with the stock
  if (!product) notFound(); // Shows the 404 page if the print doesn't exist.

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
