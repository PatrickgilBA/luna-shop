"use client";
// ============================================================================
//  THE CART
// ============================================================================
//  A "context" in React is a way to share information between every part
//  of the site. Here we share the cart, so both the menu (which shows the count)
//  and the cart page see the same thing.
//
//  The cart is saved in the browser's storage (localStorage), so it is still
//  there if the customer reloads the page or comes back later.
//
//  The cart ONLY stores which print (slug) and how many.
//  Name, price, image and stock come from Supabase through /api/products
//  (app/api/products/route.js).
// ============================================================================

import { createContext, useContext, useEffect, useState } from "react";
import { MAX_PER_PRINT } from "@/lib/limits";

const CartContext = createContext(null);
const STORAGE_KEY = "luna-cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ slug, quantity }]
  const [loaded, setLoaded] = useState(false);
  const [products, setProducts] = useState(null); // every print – null until loaded
  const [productsFailed, setProductsFailed] = useState(false);

  // When the page opens: load the saved cart.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      // Prints that no longer exist are removed once the prints have loaded (see below).
      setItems(saved.filter((item) => item && typeof item.slug === "string" && item.quantity > 0));
    } catch {
      // If something is broken, we just start with an empty cart.
    }
    setLoaded(true);
  }, []);

  // When the page opens: load the prints (with their stock). If that fails, the
  // cart still works – the checkout always checks everything before payment.
  function refreshProducts() {
    return fetch("/api/products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        setProductsFailed(!Array.isArray(data));
      })
      .catch(() => setProductsFailed(true));
  }
  useEffect(() => {
    refreshProducts();
  }, []);

  // A print by its slug, or undefined.
  const productOf = (slug) => products?.find((product) => product.slug === slug);

  // When both the cart and the prints have loaded: remove what is sold out
  // or no longer exists, and lower the quantity if fewer are left.
  useEffect(() => {
    if (!loaded || !products) return;
    setItems((current) =>
      current
        .map((item) => ({ ...item, quantity: Math.min(item.quantity, maxOf(item.slug)) }))
        .filter((item) => item.quantity > 0)
    );
  }, [loaded, products]);

  // How many of a print the cart may hold: what is in stock,
  // but never more than MAX_PER_PRINT (10). Before the prints have loaded, only 10 applies.
  const maxOf = (slug) =>
    Math.min(products ? (productOf(slug)?.stock ?? 0) : Infinity, MAX_PER_PRINT);

  // Every time the cart changes: save it.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // E.g. private browsing – the cart still works, it just isn't saved.
    }
  }, [items, loaded]);

  // Add a print. You can never add more than are in stock.
  function addItem(slug, quantity = 1) {
    const available = maxOf(slug);
    if (available <= 0) return;

    setItems((current) => {
      const existing = current.find((item) => item.slug === slug);
      if (existing) {
        return current.map((item) =>
          item.slug === slug
            ? { ...item, quantity: Math.min(item.quantity + quantity, available) }
            : item
        );
      }
      return [...current, { slug, quantity: Math.min(quantity, available) }];
    });
  }

  function setQuantity(slug, quantity) {
    if (quantity <= 0) return removeItem(slug);
    setItems((current) =>
      current.map((item) =>
        item.slug === slug ? { ...item, quantity: Math.min(quantity, maxOf(slug)) } : item
      )
    );
  }

  function removeItem(slug) {
    setItems((current) => current.filter((item) => item.slug !== slug));
  }

  function clearCart() {
    setItems([]);
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        loaded,
        products,
        productsFailed,
        productOf,
        maxOf,
        refreshProducts,
        addItem,
        setQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Use it like this in a component:  const { items, addItem } = useCart();
export function useCart() {
  return useContext(CartContext);
}
