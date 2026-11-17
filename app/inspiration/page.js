// ============================================================================
//  INSPIRATION  (address: /inspiration)
// ============================================================================
//  Photos of Luna's prints in real rooms, as ideas for where to hang them.
//  A grid of images in different sizes, in the same style as the landing
//  page. Which images are shown, and how big, is set in data/inspiration.js.
//  Clicking an image shows it full screen (components/InspirationGallery.js).
// ============================================================================

import Link from "next/link";
import InspirationGallery from "@/components/InspirationGallery";
import images from "@/data/inspiration";

export const metadata = { title: "Inspiration" };

export default function InspirationPage() {
  return (
    <>
      <section className="intro">
        <h1 className="intro-name intro-name--long">Inspiration</h1>
        <div className="intro-side">
          <p>
            Luna&apos;s prints at home.
            <br />
            Ideas for where to hang yours.
          </p>
          <div className="intro-links">
            <Link href="/shop" className="arrow-link">
              Shop prints →
            </Link>
          </div>
        </div>
      </section>

      <InspirationGallery images={images} />
    </>
  );
}
