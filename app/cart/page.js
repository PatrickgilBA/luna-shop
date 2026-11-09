"use client";
// ============================================================================
//  VARUKORGEN  (adress: /cart)
// ============================================================================
//  Kunden ser sina posters, väljer frakt-zon och klickar "Checkout".
//  Då skickas varukorgen till vår server (app/api/checkout/route.js),
//  som skapar en betalsida hos Stripe och skickar kunden dit.
// ============================================================================

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { SHIPPING_ZONES } from "@/lib/shipping";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, loaded, products, productsFailed, productOf, maxOf, setQuantity, removeItem } =
    useCart();
  const [zone, setZone] = useState("eu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Koppla ihop varukorgen med produktinfon (namn, pris, bild) från Supabase.
  const lines = items
    .map((item) => ({ ...item, product: productOf(item.slug) }))
    .filter((line) => line.product);

  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const shipping = SHIPPING_ZONES[zone].price;

  async function handleCheckout() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ slug, quantity }) => ({ slug, quantity })),
          zone,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong.");
      window.location.href = data.url; // Skicka kunden till Stripes betalsida.
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  // Gick det inte att hämta produkterna kan varukorgen inte visas.
  if (items.length > 0 && !products && productsFailed) {
    return (
      <div className="message-page">
        <h1>Something went wrong</h1>
        <p>We couldn't load the shop right now. Please reload the page.</p>
      </div>
    );
  }

  // Vänta tills varukorgen och produkterna har lästs in.
  if (!loaded || (items.length > 0 && !products)) return <div className="message-page" />;

  if (lines.length === 0) {
    return (
      <div className="message-page">
        <h1>Your cart is empty</h1>
        <p>Go find a print you love!</p>
        <Link href="/shop" className="button">
          Go to the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1>Your cart</h1>

      <ul className="cart-lines">
        {lines.map(({ slug, quantity, product }) => (
          <li key={slug} className="cart-line">
            <Link href={`/shop/${slug}`} className="cart-thumb">
              <Image src={product.images[0]} alt={product.title} fill sizes="96px" />
            </Link>
            <div className="cart-line-info">
              <Link href={`/shop/${slug}`}>
                <strong>{product.title}</strong>
              </Link>
              <span>{product.size}</span>
              <span>{formatPrice(product.price)}</span>
            </div>
            <div className="quantity">
              <button onClick={() => setQuantity(slug, quantity - 1)} aria-label="One less">
                −
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity(slug, quantity + 1)}
                disabled={quantity >= maxOf(slug)}
                aria-label="One more"
              >
                +
              </button>
            </div>
            <button className="remove" onClick={() => removeItem(slug)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <fieldset className="zones">
          <legend>Where should we ship?</legend>
          {Object.entries(SHIPPING_ZONES).map(([key, z]) => (
            <label key={key} className={zone === key ? "zone selected" : "zone"}>
              <input
                type="radio"
                name="zone"
                value={key}
                checked={zone === key}
                onChange={() => setZone(key)}
              />
              <span>
                <strong>{z.label}</strong> – {formatPrice(z.price)}
                <small>{z.deliveryText}</small>
              </span>
            </label>
          ))}
        </fieldset>

        <dl className="totals">
          <dt>Prints</dt>
          <dd>{formatPrice(subtotal)}</dd>
          <dt>Shipping</dt>
          <dd>{formatPrice(shipping)}</dd>
          <dt className="total">Total</dt>
          <dd className="total">{formatPrice(subtotal + shipping)}</dd>
        </dl>

        {error && <p className="error">{error}</p>}

        <button className="button button--big" onClick={handleCheckout} disabled={loading}>
          {loading ? "Opening checkout…" : "Checkout"}
        </button>
        <p className="note">You'll pay securely with Stripe (card, Apple Pay, Google Pay).</p>
      </div>
    </div>
  );
}
