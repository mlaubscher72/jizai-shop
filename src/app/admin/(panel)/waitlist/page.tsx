import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminWaitlist() {
  const waitlist = await db.getWaitlist();

  return (
    <main className="admin-content">
      <header className="admin-head">
        <h1>Waitlist</h1>
        <div className="admin-head-actions">
          <p className="admin-mode">{waitlist.length} Anmeldungen</p>
          <a href="/admin/waitlist/export" className="btn-ghost btn-small" data-hover>
            CSV exportieren
          </a>
        </div>
      </header>

      {waitlist.length === 0 ? (
        <p className="admin-empty">Noch keine Anmeldungen.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>E-Mail</th>
              <th>Angemeldet am</th>
            </tr>
          </thead>
          <tbody>
            {waitlist.map((w) => (
              <tr key={w.email}>
                <td>{w.email}</td>
                <td>
                  {new Date(w.createdAt).toLocaleDateString("de-CH", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
