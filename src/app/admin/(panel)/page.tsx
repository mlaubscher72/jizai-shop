import Link from "next/link";
import { db, usingSupabase } from "@/lib/db";
import { formatCHF } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [products, orders, waitlist] = await Promise.all([
    db.getProducts(),
    db.getOrders(),
    db.getWaitlist(),
  ]);

  const paidOrders = orders.filter((o) => o.status === "paid" || o.status === "shipped");
  const revenue = paidOrders.reduce((s, o) => s + o.totalRappen, 0);
  const totalStock = products.reduce((s, p) => s + p.variants.reduce((x, v) => x + v.stock, 0), 0);
  const openOrders = orders.filter((o) => o.status === "paid").length;
  const lowVariants = products.flatMap((p) =>
    p.variants.filter((v) => v.stock > 0 && v.stock <= 5).map((v) => `${p.name} ${v.size} (${v.stock})`)
  );

  return (
    <main className="admin-content">
      <header className="admin-head">
        <h1>Dashboard</h1>
        <p className="admin-mode">
          {usingSupabase ? "Supabase verbunden" : "Demo-Modus · Daten in data/store.json"}
        </p>
      </header>

      <div className="admin-stats">
        <div className="stat">
          <span className="stat-label">Umsatz (bezahlt)</span>
          <strong>{formatCHF(revenue)}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Bestellungen</span>
          <strong>{orders.length}</strong>
          <span className="stat-sub">{openOrders} zu versenden</span>
        </div>
        <div className="stat">
          <span className="stat-label">Lagerbestand</span>
          <strong>{totalStock}</strong>
          <span className="stat-sub">Stück über alle Grössen</span>
        </div>
        <div className="stat">
          <span className="stat-label">Waitlist</span>
          <strong>{waitlist.length}</strong>
        </div>
      </div>

      {lowVariants.length > 0 && (
        <div className="admin-alert">
          <strong>Bald ausverkauft:</strong> {lowVariants.join(" · ")}
        </div>
      )}

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Letzte Bestellungen</h2>
          <Link href="/admin/orders" data-hover>Alle ansehen →</Link>
        </div>
        {orders.length === 0 ? (
          <p className="admin-empty">Noch keine Bestellungen — still wie ein Dojo am Morgen.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Kunde</th><th>Artikel</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id}>
                  <td><code>{o.id}</code></td>
                  <td>{o.name}</td>
                  <td>{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                  <td>{formatCHF(o.totalRappen)}</td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
