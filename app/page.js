// ============================================================================
//  THE LANDING PAGE  (address: /)
// ============================================================================
//  A visual introduction before the shop: Luna's name and a tight grid
//  of images in different sizes, like an artist portfolio. At the end, a
//  big link into the shop.
//
//  Which images and videos are shown, and how big, is set in data/home.js.
//  The shop itself is at /shop (app/shop/page.js).
// ============================================================================

import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/products";
import LoopingVideo from "@/components/LoopingVideo";
import tiles from "@/data/home";
import site from "@/data/site";

// How much of the screen width each size takes (helps Next.js pick the image size).
const SIZES = {
  small: "(max-width: 700px) 50vw, 25vw",
  tall: "(max-width: 700px) 50vw, 25vw",
  wide: "(max-width: 700px) 100vw, 50vw",
  big: "(max-width: 700px) 100vw, 50vw",
};

export default async function HomePage() {
  // The print's name shows when you hover over an image.
  const products = await getProducts();
  const bySlug = Object.fromEntries(products.map((product) => [product.slug, product]));

  return (
    <>
      {/* ---------- The name ---------- */}
      <section className="intro">
        <h1 className="intro-name">{site.name}</h1>
        <div className="intro-side">
          <p>
            Illustrator &amp; printmaker.
            <br />
            {site.tagline}.
          </p>
          <div className="intro-links">
            <Link href="/shop" className="arrow-link">
              Shop prints →
            </Link>
            <Link href="/about" className="arrow-link">
              About Luna →
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- The image grid ---------- */}
      <section className="tiles" aria-label="Selected work">
        {tiles.map((tile, i) => {
          const product = tile.slug && bySlug[tile.slug];
          const caption = tile.caption || product?.title;
          return (
            <Link
              key={tile.image || tile.video}
              href={product ? `/shop/${product.slug}` : "/about"}
              className={`tile tile--${tile.size}`}
            >
              {tile.video ? (
                <LoopingVideo src={tile.video} poster={tile.poster} />
              ) : (
                <Image src={tile.image} alt={caption || ""} fill preload={i < 3} sizes={SIZES[tile.size]} />
              )}
              <span className="tile-caption">{caption}</span>
            </Link>
          );
        })}
      </section>

      {/* ---------- On to the shop ---------- */}
      <section className="enter">
        <Link href="/shop" className="enter-link">
          Enter the shop <span aria-hidden="true">→</span>
        </Link>
        <p>Small editions, shipped worldwide.</p>
      </section>
    </>
  );
}
