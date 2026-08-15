import { Lang, localePath, t } from "@/lib/i18n";

export default function Footer({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <footer className="footer">
      <div className="footer-top">
        <span className="footer-word">JIZAI</span>
      </div>
      <div className="footer-grid">
        <div>
          <p className="footer-label">{d.footerBrandLabel}</p>
          <p>
            {d.footerBrandA}
            <br />
            {d.footerBrandB}
          </p>
        </div>
        <div>
          <p className="footer-label">{d.footerStudioLabel}</p>
          <p>
            {d.footerStudioA}
            <br />
            {d.footerStudioB}
          </p>
        </div>
        <div>
          <p className="footer-label">{d.footerSocialLabel}</p>
          <p>
            <a href="#" data-hover>Instagram</a>
            <br />
            <a href="#" data-hover>TikTok</a>
          </p>
        </div>
        <div>
          <p className="footer-label">{d.footerContactLabel}</p>
          <p>
            <a href="mailto:hello@jizai.ch" data-hover>hello@jizai.ch</a>
          </p>
        </div>
        <div>
          <p className="footer-label">{d.footerOrderLabel}</p>
          <p>
            <a href={localePath(lang, "/bestellung")} data-hover>{d.footerTrackOrder}</a>
            <br />
            <a href="/admin" className="footer-admin" data-hover>{d.footerAdmin}</a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 JIZAI · ジザイ</span>
        <span className="footer-line-quote">First the form. Then the freedom.</span>
        <span className="footer-seal-wrap">
          <span className="footer-seal" title={d.footerSealTitle}>自在</span>
          <span className="jp-caption">{d.footerSealMeaning}</span>
        </span>
      </div>
    </footer>
  );
}
