"use client";
// Körs på tack-sidan när kunden har betalat. Visar inget på skärmen.
//   1. Ber servern bekräfta köpet hos Stripe och räkna ner lagret
//      (app/api/confirm-order).
//   2. Tömmer varukorgen och hämtar det nya lagret.

import { useEffect } from "react";
import { useCart } from "@/components/CartContext";

export default function ClearCart({ sessionId }) {
  const { loaded, clearCart, refreshProducts } = useCart();

  useEffect(() => {
    if (!loaded) return;
    clearCart();
    if (!sessionId) return;
    fetch("/api/confirm-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(() => refreshProducts())
      .catch(() => {}); // går det inte räknar webhooken ner lagret i stället
  }, [loaded]);

  return null;
}
