// The footer at the bottom of every page.

import Link from "next/link";
import site from "@/data/site";

export default function Footer() {
  return (
    <footer className="footer">
      <p>
        <a href={`mailto:${site.email}`}>{site.email}</a>
        {" · "}
        <a href={site.instagram} target="_blank" rel="noreferrer">
          Instagram {site.instagramHandle}
        </a>
      </p>
      <p>Shipping worldwide · Secure payment with Stripe</p>
      <p>
        © {new Date().getFullYear()} {site.name}
        {" · "}
        <Link href="/admin" className="footer-admin">
          Admin
        </Link>
      </p>
    </footer>
  );
}
