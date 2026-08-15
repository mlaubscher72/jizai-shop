import Link from "next/link";
import { db } from "@/lib/db";
import { actOf, formatCHF, Product } from "@/lib/types";
import { isOrderable } from "@/lib/seed";
import { Lang, localePath, productDescription, t } from "@/lib/i18n";
import HomeFx from "@/components/HomeFx";
import ComingSoon from "@/components/ComingSoon";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";
import { isComingSoon } from "@/lib/settings";
import { getSession } from "@/lib/auth";

function DropCard({ product, lang }: { product: Product; lang: Lang }) {
  const d = t(lang);
  const soon = !isOrderable(product);
  const stock = product.variants.reduce((s, v) => s + v.stock, 0);
  return (
    <Link
      href={localePath(lang, `/product/${product.slug}`)}
      className="piece"
      data-accent={product.accent}
      data-hover
    >
      <div className="piece-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.images[0] ?? ""} alt={product.name} loading="lazy" />
        {soon ? (
          <span className="piece-badge is-ha">{product.kanji} {d.badgeSoon}</span>
        ) : stock <= 0 ? (
          <span className="piece-badge is-out">{d.badgeSoldOut}</span>
        ) : stock <= 15 ? (
          <span className="piece-badge">{d.badgeLeft(stock)}</span>
        ) : null}
      </div>
      <div className="piece-info">
        <span className="piece-kanji" title={d.kanjiMeaning[product.kanji] ?? product.kanji}>
          {product.kanji}
        </span>
        <h3>
          {product.name} <em>{product.kanji}</em>
        </h3>
        <p>{productDescription(product, lang)}</p>
        <span className="piece-meta">
          {product.subtitle} · {formatCHF(product.priceRappen)}
        </span>
      </div>
    </Link>
  );
}

export default async function HomeView({
  lang,
  preview,
}: {
  lang: Lang;
  preview?: string;
}) {
  const d = t(lang);
  const products = (await db.getProducts()).filter((p) => p.active);

  // Coming-Soon-Modus: Besucher sehen die Teaser-Seite, Angemeldete den echten Shop.
  // ?vorschau=coming-soon zeigt sie auch Angemeldeten (Kontrolle vor dem Aktivieren).
  if (preview === "coming-soon") return <ComingSoon products={products} lang={lang} />;
  if (await isComingSoon()) {
    const session = await getSession();
    if (!session) return <ComingSoon products={products} lang={lang} />;
  }

  const shu = products.filter((p) => actOf(p) === "shu");
  const ha = products.filter((p) => actOf(p) === "ha");
  const ri = products.filter((p) => actOf(p) === "ri");

  return (
    <>
      <HomeFx />

      {/* PRELOADER */}
      <div className="preloader" id="preloader">
        <div className="preloader-inner">
          <div className="preloader-kanji">
            <span className="pk-char">自</span>
            <span className="pk-char">在</span>
          </div>
          <div className="preloader-line">
            <span className="preloader-line-fill"></span>
          </div>
          <div className="preloader-word">JIZAI</div>
        </div>
      </div>

      <main id="top">
        {/* HERO */}
        <section className="hero" id="hero">
          <div className="hero-bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/plate-2.jpg" alt={d.heroImgAlt} className="hero-img" id="heroImg" />
            <div className="hero-veil"></div>
          </div>

          <div className="hero-kana-vertical" aria-hidden="true">
            <span>ジ</span>
            <span>ザ</span>
            <span>イ</span>
          </div>

          <div className="hero-content">
            <p className="hero-eyebrow reveal-line">
              <span>{d.heroEyebrow}</span>
            </p>
            <h1 className="hero-title" aria-label="JIZAI">
              <span className="ht-letter">J</span>
              <span className="ht-letter">I</span>
              <span className="ht-letter">Z</span>
              <span className="ht-letter">A</span>
              <span className="ht-letter">I</span>
            </h1>
            <div className="hero-sub">
              <p className="hero-tagline reveal-line">
                <span>Begin before the noise.</span>
              </p>
              <div className="hero-seal" aria-hidden="true">自在</div>
            </div>
            <p className="jp-caption reveal-line">
              <span>{d.heroCaption}</span>
            </p>
          </div>

          <div className="hero-footer">
            <span className="hero-scroll" data-hover>
              <span className="hero-scroll-txt">{d.heroScroll}</span>
              <span className="hero-scroll-line"></span>
            </span>
            <span className="hero-drop-tag">{d.heroDropTag}</span>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            <span>
              JIZAI <em>ジザイ</em> 自在 <i>·</i> BEGIN BEFORE THE NOISE <i>·</i> QUIET FORM. FREE MIND. <i>·</i>{" "}
            </span>
            <span>
              JIZAI <em>ジザイ</em> 自在 <i>·</i> BEGIN BEFORE THE NOISE <i>·</i> QUIET FORM. FREE MIND. <i>·</i>{" "}
            </span>
          </div>
        </div>

        {/* PHILOSOPHY */}
        <section className="manifesto" id="philosophy">
          <div className="manifesto-enso" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/enso-red.png" alt="" className="enso-brush" id="ensoBrush" />
            <span className="enso-seal">自在</span>
          </div>

          <div className="manifesto-body">
            <p className="manifesto-label reveal-line">
              <span>{d.manifestoLabel}</span>
            </p>
            <h2 className="manifesto-text split-words">{d.manifestoTitle}</h2>
            <p className="manifesto-note reveal-fade">{d.manifestoNote}</p>
          </div>
        </section>

        {/* PILLARS */}
        <section className="pillars">
          <div className="pillars-head">
            <p className="section-label reveal-line">
              <span>{d.pillarsLabel}</span>
            </p>
          </div>
          <div className="pillars-grid">
            {d.pillars.map((p, i) => (
              <article className="pillar" data-hover key={p.t}>
                <span className="pillar-kanji">{p.k}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
                <span className="pillar-index">{String(i + 1).padStart(2, "0")}</span>
              </article>
            ))}
          </div>
        </section>

        {/* DROP 01 — Zwei Akte, zwei Zustände */}
        <section className="drop" id="drop">
          <div className="drop-sticky">
            <div className="drop-head">
              <p className="section-label">
                <span>{d.dropLabel}</span>
              </p>
              <h2 className="drop-title">
                {d.dropTitleA}
                <br />
                {d.dropTitleB}
              </h2>
              <p className="drop-intro">{d.dropIntro}</p>
              <p className="drop-progress">
                <span id="dropIndex">01</span> / {String(products.length).padStart(2, "0")}
              </p>
            </div>
            <div className="drop-track" id="dropTrack">
              <div className="act-panel">
                <span className="act-kanji">{d.acts[0].kanji}</span>
                <h3>{d.acts[0].title}</h3>
                <p>{d.acts[0].sub}</p>
                <span className="act-state">{d.acts[0].state}</span>
              </div>
              {shu.map((product) => (
                <DropCard product={product} lang={lang} key={product.id} />
              ))}
              <div className="act-panel is-ha">
                <span className="act-kanji">{d.acts[1].kanji}</span>
                <h3>{d.acts[1].title}</h3>
                <p>{d.acts[1].sub}</p>
                <span className="act-state">{d.acts[1].state}</span>
              </div>
              {ha.map((product) => (
                <DropCard product={product} lang={lang} key={product.id} />
              ))}
              {ri.length > 0 && (
                <>
                  <div className="act-panel is-ri">
                    <span className="act-kanji">{d.acts[2].kanji}</span>
                    <h3>{d.acts[2].title}</h3>
                    <p>{d.acts[2].sub}</p>
                    <span className="act-state">{d.acts[2].state}</span>
                  </div>
                  {ri.map((product) => (
                    <DropCard product={product} lang={lang} key={product.id} />
                  ))}
                </>
              )}
            </div>
          </div>
        </section>

        {/* SHU HA RI */}
        <section className="shuhari" id="shuhari">
          <p className="section-label reveal-line">
            <span>{d.shuhariLabel}</span>
          </p>
          <div className="shuhari-rows">
            {d.shuhari.map((row) => (
              <div className="shuhari-row reveal-fade" data-hover key={row.n}>
                <span className="sh-kanji">{row.k}</span>
                <div className="sh-body">
                  <h3>
                    {row.n} <span>— {row.s}</span>
                  </h3>
                  <p>{row.d}</p>
                </div>
                <span className="sh-drop">{row.drop}</span>
              </div>
            ))}
          </div>
        </section>

        {/* LOOKBOOK */}
        <section className="lookbook">
          <figure className="lb-item lb-a" data-speed="0.12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/plate-1.jpg" alt={d.lookbookAlts[0]} loading="lazy" />
          </figure>
          <figure className="lb-item lb-b" data-speed="-0.08">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/plate-3.jpg" alt={d.lookbookAlts[1]} loading="lazy" />
          </figure>
          <figure className="lb-item lb-c" data-speed="0.06">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/plate-4.jpg" alt={d.lookbookAlts[2]} loading="lazy" />
          </figure>
          <div className="lb-quote">
            <p className="split-words">{d.lookbookQuote}</p>
          </div>
        </section>

        {/* ABOUT / FOUNDER */}
        <section className="about" id="about">
          <div className="about-inner">
            <span className="about-seal" aria-hidden="true">自在</span>
            <p className="about-lead reveal-fade">
              {d.aboutLeadA}
              <br />
              {d.aboutLeadB}
            </p>
            <p className="about-text reveal-fade">{d.aboutText1}</p>
            <p className="about-kanji reveal-fade">{d.aboutKanji}</p>
            <p className="about-text reveal-fade">{d.aboutText2}</p>
            <p className="about-text reveal-fade">{d.aboutText3}</p>
            <p className="about-close reveal-fade">{d.aboutClose}</p>
          </div>
        </section>

        {/* WAITLIST */}
        <section className="waitlist" id="waitlist">
          <div className="waitlist-inner">
            <span className="waitlist-seal" aria-hidden="true">自在</span>
            <p className="section-label reveal-line">
              <span>{d.waitlistLabel}</span>
            </p>
            <h2 className="waitlist-title split-words">{d.waitlistTitle}</h2>
            <WaitlistForm lang={lang} />
          </div>
        </section>

        <Footer lang={lang} />
      </main>
    </>
  );
}
