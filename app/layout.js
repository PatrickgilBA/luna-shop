// ============================================================================
//  LAYOUT – the "frame" around every page
// ============================================================================
//  Everything here (menu, scrolling text, footer) shows on EVERY page.
//  {children} is where the current page is put in.
// ============================================================================

import { Ultra, DM_Sans } from "next/font/google";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import site from "@/data/site";
import "./globals.css";

// Fonts from Google Fonts. Next.js downloads them automatically.
const displayFont = Ultra({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const bodyFont = DM_Sans({ subsets: ["latin"], variable: "--font-body" });

// Title and description shown in Google and in the browser tab.
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
