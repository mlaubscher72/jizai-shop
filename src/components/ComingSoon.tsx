import { Product } from "@/lib/types";
import { Lang, localePath, switchPath, t } from "@/lib/i18n";
import { getTeaserVideoId } from "@/lib/settings";
import BrandFilm from "./BrandFilm";
import LangSwitch from "./LangSwitch";
import WaitlistForm from "./WaitlistForm";

/**
 * Coming-Soon-Ansicht: ersetzt den Shop, solange der Modus im Admin aktiv ist.
 *
 * Aufbau: Wortmarke → Film → erste Stücke → die vier Flyer-Kapitel
 * (Marke, Name, SHU·HA·RI, Brand Codes) → Waitlist.
 * Die Texte stammen 1:1 aus dem JIZAI-Flyer und liegen in beiden Sprachen
 * im Wörterbuch (`teaser`).
 */
export default async function ComingSoon({ products, lang }: { products: Product[]; lang: Lang }) {
  const d = t(lang);
  const x = d.teaser;
  const shown = products.filter((p) => p.images[0]).slice(0, 3);
  const youtubeId = await getTeaserVideoId();

  return (
    <main className="cs-page">
      <div className="cs-inner">
        <header className="cs-head">
          <h1 className="cs-word">JIZAI</h1>
          <p className="cs-kana">ジザイ</p>
          <span className="cs-seal" aria-hidden="true">自在</span>
          <p className="cs-tagline">{x.tagline}</p>
        </header>

        <p className="cs-claim">Begin before the noise.</p>

        {/* ---- Markenfilm ---- */}
        <section className="cs-section cs-film">
          <p className="section-label"><span>{x.filmLabel}</span></p>
          <h2 className="cs-h2">{x.filmTitle}</h2>
          <BrandFilm lang={lang} youtubeId={youtubeId} />
        </section>

        {/* ---- Erste Stücke ---- */}
        {shown.length > 0 && (
          <section className="cs-section">
            <p className="section-label"><span>{d.csPiecesLabel}</span></p>
            <div className={`cs-pieces cs-pieces-${shown.length}`}>
              {shown.map((p) => (
                <figure className="cs-piece" key={p.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images[0]} alt={p.name} loading="lazy" />
                  <figcaption>
                    {p.name} <em title={d.kanjiMeaning[p.kanji]}>{p.kanji}</em>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* ---- 01 · Die Marke ---- */}
        <section className="cs-section">
          <p className="section-label"><span>{x.brandLabel}</span></p>
          <h2 className="cs-h2">{x.brandTitle}</h2>
          <p className="cs-kicker">{x.brandKicker}</p>
          <p className="cs-body">{x.brandBody}</p>
          <blockquote className="cs-quote">
            <p>{x.brandQuote}</p>
            <cite>{x.brandQuoteLabel}</cite>
          </blockquote>
          <p className="cs-body">{x.brandBody2}</p>
        </section>

        {/* ---- 02 · Der Name ---- */}
        <section className="cs-section cs-name">
          <p className="section-label"><span>{x.nameLabel}</span></p>
          <h2 className="cs-h2">{x.nameTitle}</h2>
          <p className="cs-chars">{x.nameChars}</p>
          <p className="cs-body">{x.nameBody}</p>
        </section>

        {/* ---- 03 · SHU · HA · RI ---- */}
        <section className="cs-section">
          <p className="section-label"><span>{x.pathLabel}</span></p>
          <h2 className="cs-h2">{x.pathTitle}</h2>
          <p className="cs-body">{x.pathBody}</p>

          <div className="cs-stages">
            {x.stages.map((s) => (
              <article className="cs-stage" key={s.name}>
                <span className="cs-stage-kanji">{s.kanji}</span>
                <h3>
                  {s.name} <span>— {s.head}</span>
                </h3>
                <p className="cs-stage-gloss">{s.gloss}</p>
                <p className="cs-stage-line">{s.line}</p>
                <p className="cs-stage-body">{s.body}</p>
                <p className="cs-stage-quote">{s.quote}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---- 04 · Brand Codes ---- */}
        <section className="cs-section">
          <p className="section-label"><span>{x.codesLabel}</span></p>
          <h2 className="cs-h2">{x.codesTitle}</h2>
          <div className="cs-codes">
            {x.codes.map((c) => (
              <article className="cs-code" key={c.n}>
                <span className="cs-code-n">{c.n}</span>
                <h3>{c.name}</h3>
                <p>{c.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---- Waitlist ---- */}
        <section className="cs-signup" id="waitlist">
          <p className="section-label"><span>{d.csLabel}</span></p>
          <h2 className="cs-title">{d.csTitle}</h2>
          <p className="cs-note">{d.csNote}</p>
          <WaitlistForm lang={lang} />
          <p className="cs-whisper">{x.whisper}</p>
        </section>

        <footer className="cs-foot">
          <span>© 2026 JIZAI · ジザイ</span>
          <span className="cs-foot-quote">First the form. Then the freedom.</span>
          <a href="mailto:hello@jizai.ch" data-hover>hello@jizai.ch</a>
          <a href={localePath(lang, "/datenschutz")} data-hover>{d.footerPrivacy}</a>
          <a href={localePath(lang, "/impressum")} data-hover>{d.footerImprint}</a>
          {/* Die Nav ist auf der Teaser-Seite ausgeblendet — der Umschalter muss hierhin */}
          <LangSwitch lang={lang} href={switchPath(lang === "de" ? "/" : "/en")} className="cs-lang" />
        </footer>
      </div>
    </main>
  );
}
