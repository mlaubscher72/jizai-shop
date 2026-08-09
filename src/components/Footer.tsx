export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <span className="footer-word">JIZAI</span>
      </div>
      <div className="footer-grid">
        <div>
          <p className="footer-label">Brand</p>
          <p>
            Urban streetwear shaped by discipline,
            <br />
            movement and Japanese restraint.
          </p>
        </div>
        <div>
          <p className="footer-label">Studio</p>
          <p>
            Liestal, Schweiz
            <br />
            Atelier
          </p>
        </div>
        <div>
          <p className="footer-label">Social</p>
          <p>
            <a href="#" data-hover>Instagram</a>
            <br />
            <a href="#" data-hover>TikTok</a>
          </p>
        </div>
        <div>
          <p className="footer-label">Kontakt</p>
          <p>
            <a href="mailto:hello@jizai.ch" data-hover>hello@jizai.ch</a>
          </p>
        </div>
        <div>
          <p className="footer-label">Bestellung</p>
          <p>
            <a href="/bestellung" data-hover>Bestellung verfolgen</a>
            <br />
            <a href="/admin" className="footer-admin" data-hover>Admin</a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 JIZAI · ジザイ</span>
        <span className="footer-line-quote">First the form. Then the freedom.</span>
        <span className="footer-seal-wrap">
          <span className="footer-seal" title="自在 jizai — im eigenen Sein">自在</span>
          <span className="jp-caption">im eigenen Sein</span>
        </span>
      </div>
    </footer>
  );
}
