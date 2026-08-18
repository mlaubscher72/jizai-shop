import Link from "next/link";
import { Lang, localePath } from "@/lib/i18n";
import type { LegalDoc } from "@/lib/legal";
import Footer from "@/components/Footer";

/** Gemeinsame Darstellung für Datenschutzerklärung und Impressum. */
export default function LegalPageView({ lang, doc }: { lang: Lang; doc: LegalDoc }) {
  return (
    <>
      <main className="legal-page">
        <div className="legal-inner">
          <p className="section-label"><span>{doc.label}</span></p>
          <h1 className="legal-title">{doc.title}</h1>
          <p className="legal-updated">{doc.updated}</p>
          <p className="legal-intro">{doc.intro}</p>

          {doc.sections.map((s) => (
            <section className="legal-section" key={s.n}>
              <h2>
                <span className="legal-n">{s.n}</span>
                {s.title}
              </h2>
              <div className="legal-body">{s.body}</div>
            </section>
          ))}

          <Link href={localePath(lang, "/")} className="legal-back" data-hover>
            {doc.back}
          </Link>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
