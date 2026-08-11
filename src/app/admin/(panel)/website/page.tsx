import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, roleAtLeast } from "@/lib/auth";
import { isComingSoon } from "@/lib/settings";
import { setComingSoonAction } from "../../actions";

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
