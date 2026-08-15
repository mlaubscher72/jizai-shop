import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatCHF } from "@/lib/types";
import { isOrderable } from "@/lib/seed";
import { Lang, localePath, productDescription, t } from "@/lib/i18n";
import AddToCart from "@/components/AddToCart";
import ProductGallery from "@/components/ProductGallery";
import Footer from "@/components/Footer";
import { isComingSoon } from "@/lib/settings";
import { getSession } from "@/lib/auth";

/* Alte Produkt-URLs: koi → BREAK TEE, Rest → Drop-Sektion */
const LEGACY_ROUTES: Record<string, string> = {
  koi: "/product/break-tee",
  tsuru: "/#drop",
  furin: "/#drop",
  take: "/#drop",
};

export default async function ProductView({ lang, slug }: { lang: Lang; slug: string }) {
  const d = t(lang);
  const home = localePath(lang, "/");

  if (LEGACY_ROUTES[slug]) {
    const target = LEGACY_ROUTES[slug];
    redirect(target.startsWith("/#") ? `${home}#drop` : localePath(lang, target));
  }

  if (await isComingSoon()) {
    const session = await getSession();
    if (!session) redirect(home);
  }

  const product = await db.getProductBySlug(slug);
  if (!product || !product.active) notFound();

  const orderable = isOrderable(product);

  return (
    <>
      <main className="product-page" style={{ "--accent": product.accent } as React.CSSProperties}>
        <div className="product-grid">
          <ProductGallery
            images={product.images}
            alt={product.name}
            kanji={product.kanji}
            badge={orderable ? undefined : `${product.kanji} ${d.badgeSoon}`}
            lang={lang}
          />

          <div className="product-info">
            <Link href={`${home}#drop`} className="product-back" data-hover>
              {d.productBack}
            </Link>
            <h1 className="product-title">
              {product.name} <em>{product.kanji}</em>
            </h1>
            <p className="jp-caption product-act">{d.kanjiMeaning[product.kanji] ?? ""}</p>
            <p className="product-desc">{productDescription(product, lang)}</p>

            {orderable ? (
              <AddToCart product={product} lang={lang} />
            ) : (
              <div className="product-notify">
                <p className="product-notify-price">{formatCHF(product.priceRappen)}</p>
                <p className="product-notify-note">{d.notifyNote}</p>
                <Link href={`${home}#waitlist`} className="btn-seal atc-btn" data-hover>
                  {d.notifyButton} <span className="btn-kana" title="参加 sanka — teilnehmen">参加</span>
                </Link>
              </div>
            )}

            <ul className="product-specs">
              <li><span>{d.specFit}</span> {d.specFitValue}</li>
              <li><span>{d.specFabric}</span> {product.subtitle}</li>
              <li><span>{d.specPrint}</span> {d.specPrintValue}</li>
              <li><span>{d.specShipping}</span> {d.specShippingValue}</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
