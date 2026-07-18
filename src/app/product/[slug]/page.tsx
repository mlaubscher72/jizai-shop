import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatCHF } from "@/lib/types";
import { isOrderable } from "@/lib/seed";
import AddToCart from "@/components/AddToCart";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

/* Alte Produkt-URLs: koi → BREAK TEE, Rest → Drop-Sektion */
const LEGACY_ROUTES: Record<string, string> = {
  koi: "/product/break-tee",
  tsuru: "/#drop",
  furin: "/#drop",
  take: "/#drop",
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (LEGACY_ROUTES[slug]) redirect(LEGACY_ROUTES[slug]);

  const product = await db.getProductBySlug(slug);
  if (!product || !product.active) notFound();

  const orderable = isOrderable(product);

  return (
    <>
      <main className="product-page" style={{ "--accent": product.accent } as React.CSSProperties}>
        <div className="product-grid">
          <div className="product-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={product.name} />
            <span className="product-kanji-wm" aria-hidden="true">{product.kanji}</span>
            {!orderable && <span className="piece-badge is-ha product-ha-badge">破 BALD</span>}
          </div>

          <div className="product-info">
            <Link href="/#drop" className="product-back" data-hover>
              ← Drop 01 · 守破 SHU × HA
            </Link>
            <h1 className="product-title">
              {product.name} <em>{product.kanji}</em>
            </h1>
            <p className="product-desc">{product.description}</p>

            {orderable ? (
              <AddToCart product={product} />
            ) : (
              <div className="product-notify">
                <p className="product-notify-price">{formatCHF(product.priceRappen)}</p>
                <p className="product-notify-note">
                  Akt II — noch nicht bestellbar. Trag dich ein, wir sagen dir, wenn es losgeht.
                </p>
                <Link href="/#waitlist" className="btn-seal atc-btn" data-hover>
                  Benachrichtigen <span className="btn-kana">参加</span>
                </Link>
              </div>
            )}

            <ul className="product-specs">
              <li><span>Fit</span> Oversized, boxy, dropped shoulders</li>
              <li><span>Stoff</span> {product.subtitle}</li>
              <li><span>Print</span> Siebdruck · kleines 自在-Seal</li>
              <li><span>Versand</span> CH CHF 9.– · 2–4 Werktage</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
