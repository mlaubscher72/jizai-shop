import type { Metadata } from "next";
import { Archivo, Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import SiteFx from "@/components/SiteFx";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-archivo",
});

const shippori = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-shippori",
  preload: false,
});

const zenkaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-zenkaku",
  preload: false,
});

/* metadataBase macht die hreflang-/canonical-Pfade der Seiten zu absoluten URLs */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://jizaihouse.com"),
  title: "JIZAI — Begin before the noise.",
  description:
    "JIZAI — Urban Streetwear, geformt von Disziplin, Bewegung und japanischer Zurückhaltung. Drop 01 · 守破 SHU × HA.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${archivo.variable} ${shippori.variable} ${zenkaku.variable}`}>
      <body>
        <CartProvider>
          <div className="cursor-dot" id="cursorDot"></div>
          <div className="cursor-ring" id="cursorRing"></div>
          <div className="grain" aria-hidden="true"></div>
          <SiteFx />
          <Nav />
          <CartDrawer />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
