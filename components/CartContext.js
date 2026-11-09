"use client";
// ============================================================================
//  VARUKORGEN
// ============================================================================
//  En "context" i React är ett sätt att dela information mellan alla delar
//  av sidan. Här delar vi varukorgen, så att både menyn (som visar antalet)
//  och varukorgssidan ser samma sak.
//
//  Varukorgen sparas i webbläsarens minne (localStorage), så den finns kvar
//  om kunden laddar om sidan eller kommer tillbaka senare.
//
//  I varukorgen sparar vi BARA vilken poster (slug) och hur många.
//  Namn, pris, bild och lager hämtas från Supabase via /api/products
//  (app/api/products/route.js).
// ============================================================================

import { createContext, useContext, useEffect, useState } from "react";
import { MAX_PER_PRINT } from "@/lib/limits";

const CartContext = createContext(null);
const STORAGE_KEY = "luna-cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ slug, quantity }]
  const [loaded, setLoaded] = useState(false);
  const [products, setProducts] = useState(null); // alla posters – null tills de laddats
  const [productsFailed, setProductsFailed] = useState(false);

  // När sidan öppnas: läs in sparad varukorg.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      // Posters som inte längre finns tas bort när produkterna har laddats (se nedan).
      setItems(saved.filter((item) => item && typeof item.slug === "string" && item.quantity > 0));
    } catch {
      // Om något är trasigt börjar vi bara med en tom varukorg.
    }
    setLoaded(true);
  }, []);

  // När sidan öppnas: hämta produkterna (med lagret). Går det inte, fungerar
  // varukorgen ändå – kassan kontrollerar alltid allt innan betalningen.
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

  // En poster utifrån dess slug, eller undefined.
  const productOf = (slug) => products?.find((product) => product.slug === slug);

  // När både varukorgen och produkterna har laddats: ta bort det som sålt slut
  // eller inte finns längre, och minska antalet om det finns färre kvar.
  useEffect(() => {
    if (!loaded || !products) return;
    setItems((current) =>
      current
        .map((item) => ({ ...item, quantity: Math.min(item.quantity, maxOf(item.slug)) }))
        .filter((item) => item.quantity > 0)
    );
  }, [loaded, products]);

  // Hur många av en poster man får ha i varukorgen: det som finns i lager,
  // men aldrig fler än MAX_PER_PRINT (10). Innan produkterna laddats gäller bara 10.
  const maxOf = (slug) =>
    Math.min(products ? (productOf(slug)?.stock ?? 0) : Infinity, MAX_PER_PRINT);

  // Varje gång varukorgen ändras: spara den.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // T.ex. privat surfläge – varukorgen fungerar ändå, sparas bara inte.
    }
  }, [items, loaded]);

  // Lägg till en poster. Man kan aldrig lägga fler än det som finns i lager.
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

// Använd så här i en komponent:  const { items, addItem } = useCart();
export function useCart() {
  return useContext(CartContext);
}
