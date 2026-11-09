// Sidfoten längst ner på varje sida.

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
      </p>
    </footer>
  );
}
