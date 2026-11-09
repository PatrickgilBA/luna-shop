"use client";
// Runs on the thank-you page after the customer has paid. Shows nothing on screen.
//   1. Asks the server to confirm the order with Stripe and lower the stock
//      (app/api/confirm-order).
//   2. Empties the cart and loads the new stock.

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
      .catch(() => {}); // if this fails, the webhook lowers the stock instead
  }, [loaded]);

  return null;
}
