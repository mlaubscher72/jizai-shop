import Link from "next/link";
import { db } from "@/lib/db";
import { formatCHF } from "@/lib/types";
import HomeFx from "@/components/HomeFx";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = (await db.getProducts()).filter((p) => p.active);

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
            <img
              src="/assets/plate-2.jpg"
              alt="JIZAI Oversized Tee — ruhige Bewegung im Nebel"
              className="hero-img"
              id="heroImg"
            />
            <div className="hero-veil"></div>
          </div>

          <div className="hero-kana-vertical" aria-hidden="true">
            <span>ジ</span>
            <span>ザ</span>
            <span>イ</span>
          </div>

          <div className="hero-content">
            <p className="hero-eyebrow reveal-line">
              <span>Budo-rooted ritual streetwear · Liestal, CH</span>
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
          </div>

          <div className="hero-footer">
            <span className="hero-scroll" data-hover>
              <span className="hero-scroll-txt">Scroll</span>
              <span className="hero-scroll-line"></span>
            </span>
            <span className="hero-drop-tag">Drop 01 · 守 SHU — jetzt bestellbar</span>
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
            <img src="/assets/enso-brush.png" alt="" className="enso-brush" id="ensoBrush" />
            <span className="enso-seal">自在</span>
          </div>

          <div className="manifesto-body">
            <p className="manifesto-label reveal-line">
              <span>所以 — Warum JIZAI</span>
            </p>
            <h2 className="manifesto-text split-words">
              Freiheit durch Meisterschaft — nicht durch lautes Auftreten. 自在 heisst: im eigenen Sein. Erst die
              Form. Dann die Freiheit.
            </h2>
            <p className="manifesto-note reveal-fade">
              JIZAI kommt nicht <em>über</em> Japan — JIZAI kommt <em>aus einer Praxis</em>: jahrzehntelang gelebte
              Kampfkunst, der Atem vor der Handlung, die erste Kata des Tages. Kaffee und Matcha sind das Ritual.
              Fashion ist das Produkt. Die Praxis ist der Grund.
            </p>
          </div>
        </section>

        {/* PILLARS */}
        <section className="pillars">
          <div className="pillars-head">
            <p className="section-label reveal-line">
              <span>Brand Pillars</span>
            </p>
          </div>
          <div className="pillars-grid">
            {[
              { k: "形", t: "Form", d: "Disziplin und Präzision. Nichts ist zufällig gesetzt." },
              { k: "息", t: "Breath", d: "Der Atem vor der Handlung. Der ruhige Moment vor dem Tag." },
              { k: "静", t: "Silence", d: "Reduktion statt Lärm. Ruhe und Fokus als Sprache." },
              { k: "匠", t: "Craft", d: "Indigo, Sashiko, Keramik, Sumi-e — japanisches Handwerk." },
              { k: "響", t: "Sound", d: "Jede Kollektion trägt ihr eigenes Soundscape." },
            ].map((p, i) => (
              <article className="pillar" data-hover key={p.t}>
                <span className="pillar-kanji">{p.k}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
                <span className="pillar-index">{String(i + 1).padStart(2, "0")}</span>
              </article>
            ))}
          </div>
        </section>

        {/* DROP 01 — Produkte aus der DB */}
        <section className="drop" id="drop">
          <div className="drop-sticky">
            <div className="drop-head">
              <p className="section-label">
                <span>Drop 01 · 守 SHU — Die Form befolgen</span>
              </p>
              <h2 className="drop-title">
                Begin
                <br />
                in silence.
              </h2>
              <p className="drop-progress">
                <span id="dropIndex">01</span> / {String(products.length).padStart(2, "0")}
              </p>
            </div>
            <div className="drop-track" id="dropTrack">
              {products.map((product) => {
                const stock = product.variants.reduce((s, v) => s + v.stock, 0);
                return (
                  <Link
                    href={`/product/${product.slug}`}
                    className="piece"
                    data-accent={product.accent}
                    data-hover
                    key={product.id}
                  >
                    <div className="piece-media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.image} alt={`JIZAI ${product.name} Tee`} loading="lazy" />
                      {stock <= 0 ? (
                        <span className="piece-badge is-out">Ausverkauft</span>
                      ) : stock <= 15 ? (
                        <span className="piece-badge">Nur noch {stock} Stück</span>
                      ) : null}
                    </div>
                    <div className="piece-info">
                      <span className="piece-kanji">{product.kanji}</span>
                      <h3>
                        {product.name} <em>— {product.subtitle}</em>
                      </h3>
                      <p>{product.description}</p>
                      <span className="piece-meta">
                        Oversized Heavyweight Tee · 280 GSM · {formatCHF(product.priceRappen)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* SHU HA RI */}
        <section className="shuhari" id="shuhari">
          <p className="section-label reveal-line">
            <span>Kollektions-Architektur</span>
          </p>
          <div className="shuhari-rows">
            {[
              { k: "守", n: "SHU", s: "Die Form befolgen", d: "Das Fundament. Reduziert, diszipliniert. Begin in silence.", drop: "Drop 01" },
              { k: "破", n: "HA", s: "Die Form brechen", d: "Mehr Kontrast. Der rebellische Unterton bricht auf.", drop: "Drop 02" },
              { k: "離", n: "RI", s: "Die Form transzendieren", d: "自在 selbst — mühelose Freiheit, die freiesten Stücke.", drop: "Drop 03" },
            ].map((row) => (
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
            <img src="/assets/plate-1.jpg" alt="JIZAI Lookbook — stiller Stand" loading="lazy" />
          </figure>
          <figure className="lb-item lb-b" data-speed="-0.08">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/plate-3.jpg" alt="JIZAI Lookbook — Bewegung im Wasser" loading="lazy" />
          </figure>
          <figure className="lb-item lb-c" data-speed="0.06">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/plate-4.jpg" alt="JIZAI Lookbook — Koi Backprint" loading="lazy" />
          </figure>
          <div className="lb-quote">
            <p className="split-words">The quietest piece in the room — and still the strongest.</p>
          </div>
        </section>

        {/* WAITLIST */}
        <section className="waitlist" id="waitlist">
          <div className="waitlist-inner">
            <span className="waitlist-seal" aria-hidden="true">自在</span>
            <p className="section-label reveal-line">
              <span>Drop 02 · 破 HA — bald</span>
            </p>
            <h2 className="waitlist-title split-words">Sei da, bevor der Lärm beginnt.</h2>
            <WaitlistForm />
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
