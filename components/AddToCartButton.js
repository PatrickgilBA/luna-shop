"use client";
// The "Add to cart" button on the product page, with a quantity selector (− 1 +).
// The cart can hold at most MAX_PER_PRINT (10) of the same print,
// and never more than are in stock.

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { MAX_PER_PRINT } from "@/lib/limits";

export default function AddToCartButton({ product }) {
  const { items, addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(0);

  const inCart = items.find((item) => item.slug === product.slug)?.quantity || 0;
  const soldOut = product.stock <= 0;

  // How many more may be added to the cart.
  const maxAddable = Math.max(0, Math.min(product.stock, MAX_PER_PRINT) - inCart);
  const maxReached = maxAddable <= 0;
  const amount = Math.min(quantity, Math.max(1, maxAddable)); // keep the quantity within the limit

  if (soldOut) {
    return (
      <button className="button" disabled>
        Sold out
      </button>
    );
  }

  function handleClick() {
    addItem(product.slug, amount);
    setJustAdded(amount);
    setQuantity(1);
    setTimeout(() => setJustAdded(0), 1500);
  }

  let label = "Add to cart";
  if (justAdded) label = `Added ${justAdded}! ✿`;
  else if (maxReached) label = inCart >= MAX_PER_PRINT ? `Max ${MAX_PER_PRINT} per print` : "All in your cart";

  return (
    <div className="add-to-cart">
      <div className="add-row">
        {!maxReached && (
          <div className="quantity" role="group" aria-label="Quantity">
            <button
              onClick={() => setQuantity(amount - 1)}
              disabled={amount <= 1}
              aria-label="One less"
            >
              −
            </button>
            <span aria-live="polite">{amount}</span>
            <button
              onClick={() => setQuantity(amount + 1)}
              disabled={amount >= maxAddable}
              aria-label="One more"
            >
              +
            </button>
          </div>
        )}
        <button className="button" onClick={handleClick} disabled={maxReached}>
          {label}
        </button>
      </div>
      {inCart > 0 && (
        <Link href="/cart" className="small-link">
          {inCart} in your cart → Go to cart
        </Link>
      )}
      {product.stock <= 3 && <p className="low-stock">Only {product.stock} left!</p>}
    </div>
  );
}
