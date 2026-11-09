// ============================================================================
//  STARTSIDAN  (adress: /)
// ============================================================================
//  En visuell introduktion innan butiken: Lunas namn och ett tätt rutnät
//  av bilder i olika storlekar, som i en konstnärsportfolio. Sist en
//  stor länk in till butiken.
//
//  Vilka bilder och videor som visas, och hur stora, ändras i data/home.js.
//  Själva butiken ligger på /shop (app/shop/page.js).
// ============================================================================

import Link from "next/link";
import Image from "next/image";
import { getProduct } from "@/data/products";
import LoopingVideo from "@/components/LoopingVideo";
import tiles from "@/data/home";
import site from "@/data/site";

// Hur stor del av skärmens bredd varje storlek tar (hjälper Next.js välja bildstorlek).
const SIZES = {
  small: "(max-width: 700px) 50vw, 25vw",
  tall: "(max-width: 700px) 50vw, 25vw",
  wide: "(max-width: 700px) 100vw, 50vw",
  big: "(max-width: 700px) 100vw, 50vw",
};

export default function HomePage() {
  return (
    <>
      {/* ---------- Namnet ---------- */}
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

      {/* ---------- Rutnätet med bilder ---------- */}
      <section className="tiles" aria-label="Selected work">
        {tiles.map((tile, i) => {
          const product = tile.slug && getProduct(tile.slug);
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

      {/* ---------- Vidare till butiken ---------- */}
      <section className="enter">
        <Link href="/shop" className="enter-link">
          Enter the shop <span aria-hidden="true">→</span>
        </Link>
        <p>Small editions, shipped worldwide.</p>
      </section>
    </>
  );
}
