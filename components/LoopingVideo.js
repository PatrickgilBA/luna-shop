"use client";
// En video som spelar ljudlöst och om och om igen (loop), som en levande bild.
// Används i rutnätet på startsidan.
//
// Webbläsare spelar bara upp videor automatiskt om ljudet är av, därför "muted".
// "playsInline" gör att iPhone spelar videon i rutan i stället för i helskärm.
// Har besökaren stängt av animationer i sin dator står videon still.

import { useEffect, useRef } from "react";

export default function LoopingVideo({ src, poster }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true; // säkerställ ljudlöst, annars vägrar vissa webbläsare att starta
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
    } else {
      video.play().catch(() => {}); // går det inte att starta syns stillbilden (poster)
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
