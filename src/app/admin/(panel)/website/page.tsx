import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, roleAtLeast } from "@/lib/auth";
import { getTeaserVideoId, isComingSoon } from "@/lib/settings";
import { setComingSoonAction, setTeaserVideoAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function WebsitePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const canEdit = roleAtLeast(session.role, "manager");
  const { error, ok } = await searchParams;

  const active = await isComingSoon();
  const youtubeId = await getTeaserVideoId();
  const products = (await db.getProducts()).filter((p) => p.active && p.images[0]);
  const preview = products.slice(0, 3);

  return (
    <main className="admin-content">
      <header className="admin-head">
        <h1>Website</h1>
        <p className="admin-mode">Was Besucher auf der Startseite sehen.</p>
      </header>

      {ok && <div className="admin-alert sec-ok"><strong>Gespeichert.</strong></div>}
      {error === "migration" && (
        <div className="admin-alert">
          <strong>Datenbank noch nicht bereit.</strong> Führe einmalig{" "}
          <code>supabase/migration-settings.sql</code> im Supabase SQL-Editor aus.
        </div>
      )}
      {error === "youtube" && (
        <div className="admin-alert">
          <strong>Das war kein gültiger YouTube-Link.</strong> Erlaubt sind der normale
          Link, ein youtu.be-Kurzlink, ein Shorts-Link oder die blosse Video-ID.
        </div>
      )}

      <section className="admin-section">
        <div className="sec-status">
          <span className={`badge ${active ? "badge-cancelled" : "badge-paid"}`}>
            {active ? "Coming Soon aktiv — Shop verborgen" : "Shop ist öffentlich"}
          </span>
        </div>

        <div className="sec-box">
          <p>
            Im Coming-Soon-Modus sehen Besucher nur eine Teaser-Seite mit Wortmarke,
            bis zu drei Produktbildern und dem Waitlist-Feld. Produktseiten sind gesperrt.
          </p>
          <ul className="cs-admin-facts">
            <li>Du selbst siehst als Angemeldete:r weiterhin den echten Shop.</li>
            <li>
              <strong>Bestellverfolgung bleibt offen</strong> — bestehende Kunden kommen
              weiter an ihre Bestellung.
            </li>
            <li>Die Bilder kommen automatisch aus deinen aktiven Produkten (die ersten drei).</li>
          </ul>

          {preview.length > 0 ? (
            <div className="cs-admin-preview">
              {preview.map((p) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={p.id} src={p.images[0]} alt={p.name} />
              ))}
            </div>
          ) : (
            <p className="ord-note">
              Noch kein aktives Produkt mit Bild — die Teaser-Seite zeigt dann nur die Wortmarke.
            </p>
          )}

          {canEdit ? (
            <form action={setComingSoonAction} className="sec-form">
              <input type="hidden" name="active" value={active ? "0" : "1"} />
              <button
                type="submit"
                className={active ? "btn-ghost btn-small" : "btn-seal btn-small"}
                data-hover
              >
                {active ? "Shop wieder öffnen" : "Coming Soon aktivieren"}
              </button>
            </form>
          ) : (
            <p className="ord-note">Zum Ändern brauchst du die Rolle Manager oder Admin.</p>
          )}
        </div>
      </section>

      <section className="admin-section">
        <h2 className="au-subhead">Markenfilm</h2>
        <div className="sec-box">
          <div className="sec-status">
            <span className={`badge ${youtubeId ? "badge-paid" : "badge-pending"}`}>
              {youtubeId ? `YouTube · ${youtubeId}` : "Eigene Videodatei"}
            </span>
          </div>
          <p>
            Der Film auf der Teaser-Seite lädt in beiden Fällen erst, wenn jemand auf Play
            drückt — vorher ist nur das Standbild da. Das spart Traffic und erspart der
            Seite einen Cookie-Banner.
          </p>
          <ul className="cs-admin-facts">
            <li>
              <strong>Mit YouTube-Link:</strong> der Film kommt von YouTube und kostet nichts
              vom Supabase-Kontingent. Empfohlen.
            </li>
            <li>
              <strong>Feld leer:</strong> die Seite spielt die eigene Datei aus dem Storage —
              rund 21 MB pro Abspielung, also etwa 235 Abrufe im Monat.
            </li>
          </ul>

          {canEdit ? (
            <form action={setTeaserVideoAction} className="sec-form">
              <label>
                <span>YouTube-Link oder Video-ID</span>
                <input
                  type="text"
                  name="youtube"
                  defaultValue={youtubeId ?? ""}
                  placeholder="https://youtube.com/shorts/… oder leer lassen"
                  spellCheck={false}
                  autoCapitalize="none"
                />
              </label>
              <button type="submit" className="btn-seal btn-small" data-hover>
                Speichern
              </button>
            </form>
          ) : (
            <p className="ord-note">Zum Ändern brauchst du die Rolle Manager oder Admin.</p>
          )}
        </div>
      </section>

      <section className="admin-section">
        <h2 className="au-subhead">Vorschau</h2>
        <p className="sec-note">
          So sieht die Seite für Besucher aus — auch wenn der Modus noch aus ist:{" "}
          <a href="/?vorschau=coming-soon" target="_blank" data-hover>
            Teaser-Seite öffnen ↗
          </a>
        </p>
      </section>
    </main>
  );
}
