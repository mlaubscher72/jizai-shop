import { Product } from "@/lib/types";
import { Lang, switchPath, t } from "@/lib/i18n";
import LangSwitch from "./LangSwitch";
import WaitlistForm from "./WaitlistForm";

/**
 * Coming-Soon-Ansicht: ersetzt den Shop, solange der Modus im Admin aktiv ist.
 * Bewusst reduziert — Wortmarke, drei Stücke, ein Feld. Sonst nichts.
 */
export default function ComingSoon({ products, lang }: { products: Product[]; lang: Lang }) {
  const d = t(lang);
  const shown = products.filter((p) => p.images[0]).slice(0, 3);

  return (
    <main className="cs-page">
      <div className="cs-inner">
        <header className="cs-head">
          <h1 className="cs-word">JIZAI</h1>
          <p className="cs-kana">ジザイ</p>
          <span className="cs-seal" aria-hidden="true">自在</span>
        </header>

        <p className="cs-claim">Begin before the noise.</p>

        {shown.length > 0 && (
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
        )}

        <section className="cs-signup" id="waitlist">
          <p className="section-label"><span>{d.csLabel}</span></p>
          <h2 className="cs-title">{d.csTitle}</h2>
          <p className="cs-note">{d.csNote}</p>
          <WaitlistForm lang={lang} />
        </section>

        <footer className="cs-foot">
          <span>© 2026 JIZAI · ジザイ</span>
          <span className="cs-foot-quote">First the form. Then the freedom.</span>
          <a href="mailto:hello@jizai.ch" data-hover>hello@jizai.ch</a>
          {/* Die Nav ist auf der Teaser-Seite ausgeblendet — der Umschalter muss hierhin */}
          <LangSwitch lang={lang} href={switchPath(lang === "de" ? "/" : "/en")} className="cs-lang" />
        </footer>
      </div>
    </main>
  );
}
