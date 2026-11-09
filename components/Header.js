"use client";
// Menyn högst upp på varje sida.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";
import site from "@/data/site";

export default function Header() {
  const { count } = useCart();
  const pathname = usePathname();

  // Markera länken till sidan man är på just nu.
  const isActive = (href) => pathname.startsWith(href);

  return (
    <header className="header">
      <Link href="/" className="logo">
        {site.name}
      </Link>
      <nav className="nav">
        <Link href="/shop" className={isActive("/shop") ? "active" : ""}>
          Shop
        </Link>
        <Link href="/about" className={isActive("/about") ? "active" : ""}>
          About
        </Link>
        <Link href="/cart" className={`cart-link ${isActive("/cart") ? "active" : ""}`}>
          Cart <span className="cart-count">{count}</span>
        </Link>
      </nav>
    </header>
  );
}
