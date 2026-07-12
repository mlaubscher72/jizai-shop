import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import AddToCart from "@/components/AddToCart";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await db.getProductBySlug(slug);
  if (!product || !product.active) notFound();

  return (
    <>
      <main className="product-page" style={{ "--accent": product.accent } as React.CSSProperties}>
        <div className="product-grid">
          <div className="product-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={`JIZAI ${product.name} Tee`} />
            <span className="product-kanji-wm" aria-hidden="true">{product.kanji}</span>
          </div>

          <div className="product-info">
            <Link href="/#drop" className="product-back" data-hover>
              ← Drop 01 · 守 SHU
            </Link>
            <h1 className="product-title">
              {product.name} <em>— {product.subtitle}</em>
            </h1>
            <p className="product-desc">{product.description}</p>

            <AddToCart product={product} />

            <div className="product-story">
              <p className="section-label"><span>Die Geschichte</span></p>
              <p>{product.story}</p>
            </div>

            <ul className="product-specs">
              <li><span>Fit</span> Oversized, boxy, dropped shoulders</li>
              <li><span>Stoff</span> 280 GSM Heavyweight Cotton</li>
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
