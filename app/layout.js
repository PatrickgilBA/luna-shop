// ============================================================================
//  LAYOUT – "ramen" runt alla sidor
// ============================================================================
//  Allt här (meny, rullande text, sidfot) syns på VARJE sida.
//  {children} är platsen där den aktuella sidan stoppas in.
// ============================================================================

import { Ultra, DM_Sans } from "next/font/google";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import site from "@/data/site";
import "./globals.css";

// Typsnitt från Google Fonts. Next.js laddar ner dem automatiskt.
const displayFont = Ultra({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const bodyFont = DM_Sans({ subsets: ["latin"], variable: "--font-body" });

// Titel och beskrivning som syns i Google och i webbläsarfliken.
export const metadata = {
  title: { default: `${site.name} – Riso prints`, template: `%s – ${site.name}` },
  description: `${site.tagline}. Shop original risograph posters by ${site.name}.`,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <CartProvider>
          <Header />
          <Marquee text="RISO PRINTS · MADE BY HAND · SHIPPING WORLDWIDE" />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
