"use client";
// ============================================================================
//  THE INSPIRATION GRID, WITH FULL-SCREEN VIEWING
// ============================================================================
//  Click an image to see it on the whole screen. In full screen:
//    • ← and → (buttons or keys) show the previous / next image
//    • × , Esc, or a click anywhere except the arrows closes it
//  It uses the browser's own <dialog>, which keeps keyboard focus inside
//  while it is open and closes with Esc by itself.
// ============================================================================

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// How much of the screen width each size takes (helps Next.js pick the image size).
const SIZES = {
  small: "(max-width: 700px) 50vw, 25vw",
  tall: "(max-width: 700px) 50vw, 25vw",
  wide: "(max-width: 700px) 100vw, 50vw",
  big: "(max-width: 700px) 100vw, 50vw",
};

export default function InspirationGallery({ images }) {
  const dialog = useRef(null);
  const [open, setOpen] = useState(null); // the index of the image shown, or null

  const show = (index) => setOpen((index + images.length) % images.length);

  // Open and close the dialog when the chosen image changes.
  useEffect(() => {
    const element = dialog.current;
    if (open !== null && !element.open) element.showModal();
    if (open === null && element.open) element.close();
  }, [open]);

  // Arrow keys switch images while the dialog is open.
  function onKeyDown(event) {
    if (event.key === "ArrowRight") show(open + 1);
    if (event.key === "ArrowLeft") show(open - 1);
  }

  const current = open !== null ? images[open] : null;

  return (
    <>
      <section className="tiles" aria-label="Inspiration images">
        {images.map((tile, i) => (
          <button
            key={tile.image}
            type="button"
            className={`tile tile--${tile.size}`}
            onClick={() => setOpen(i)}
            aria-label={`Show full screen: ${tile.alt}`}
          >
            <Image src={tile.image} alt={tile.alt} fill preload={i < 3} sizes={SIZES[tile.size]} />
          </button>
        ))}
      </section>

      <dialog
        ref={dialog}
        className="lightbox"
        aria-label="Inspiration image, full screen"
        onClose={() => setOpen(null)}
        onKeyDown={onKeyDown}
        // A click anywhere except on a button (the arrows) closes it.
        onClick={(event) => !event.target.closest("button") && setOpen(null)}
      >
        {current && (
          <>
            <Image
              key={current.image}
              src={current.image}
              alt={current.alt}
              fill
              sizes="100vw"
              className="lightbox-image"
            />
            <p className="lightbox-count" aria-live="polite">
              {open + 1} / {images.length}
            </p>
            <button type="button" className="lightbox-close" onClick={() => setOpen(null)} aria-label="Close">
              ×
            </button>
            <button type="button" className="lightbox-prev" onClick={() => show(open - 1)} aria-label="Previous image">
              ←
            </button>
            <button type="button" className="lightbox-next" onClick={() => show(open + 1)} aria-label="Next image">
              →
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
