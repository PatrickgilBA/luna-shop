"use client";
// The images on the product page: one large image + small ones to click.

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images, title }) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="gallery">
      <div className="gallery-main">
        <Image
          src={images[selected]}
          alt={title}
          fill
          preload
          sizes="(max-width: 800px) 100vw, 55vw"
        />
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((src, i) => (
            <button
              key={src}
              className={i === selected ? "thumb selected" : "thumb"}
              onClick={() => setSelected(i)}
              aria-label={`Show image ${i + 1} of ${title}`}
            >
              <Image src={src} alt="" fill sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
