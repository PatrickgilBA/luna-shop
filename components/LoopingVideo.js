"use client";
// A video that plays silently over and over (loop), like a living picture.
// Used in the landing page grid.
//
// Browsers only autoplay videos without sound, hence "muted".
// "playsInline" makes iPhones play the video in its tile instead of full screen.
// If the visitor has turned off animations on their computer, the video stays still.

import { useEffect, useRef } from "react";

export default function LoopingVideo({ src, poster }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true; // make sure it is silent, otherwise some browsers refuse to start it
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
    } else {
      video.play().catch(() => {}); // if it can't start, the still image (poster) shows
    }
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
}
