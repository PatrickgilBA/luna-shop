// ============================================================================
//  ABOUT-SIDAN  (adress: /about)
// ============================================================================
//  Texten ändras i data/site.js. Bilderna ligger i public/images/artist/.
// ============================================================================

import Image from "next/image";
import site from "@/data/site";

export const metadata = { title: "About" };

// Bilderna på konstnären. Första bilden blir stor.
const photos = [
  { src: "/images/artist/luna-1.jpg", alt: `${site.name} in the studio` },
  { src: "/images/artist/luna-2.jpg", alt: `${site.name} at an exhibition` },
  { src: "/images/artist/luna-3.jpg", alt: `${site.name} with textile works` },
  { src: "/images/artist/luna-4.jpg", alt: `${site.name} in front of large textile works` },
];

export default function AboutPage() {
  return (
    <div className="about">
      <div className="about-main">
        <div className="about-photo">
          <Image src={photos[0].src} alt={photos[0].alt} fill preload sizes="(max-width: 800px) 100vw, 45vw" />
        </div>
        <div className="about-text">
          <h1>About</h1>
          {site.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>
            Say hi: <a href={`mailto:${site.email}`}>{site.email}</a>
            <br />
            Instagram:{" "}
            <a href={site.instagram} target="_blank" rel="noreferrer">
              {site.instagramHandle}
            </a>
          </p>
        </div>
      </div>

      <div className="about-strip">
        {photos.slice(1).map((photo) => (
          <div key={photo.src} className="about-strip-photo">
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 800px) 100vw, 33vw" />
          </div>
        ))}
      </div>
    </div>
  );
}
