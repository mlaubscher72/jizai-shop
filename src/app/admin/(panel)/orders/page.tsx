import { db } from "@/lib/db";
import { formatCHF, OrderStatus } from "@/lib/types";
import { setOrderStatusAction } from "../../actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Zahlung offen",
  paid: "Bezahlt",
  shipped: "Versendet",
  cancelled: "Storniert",
};

export default async function AdminOrders() {
  const orders = await db.getOrders();

  return (
    <main className="admin-content">
      <header className="admin-head">
        <h1>Bestellungen</h1>
        <p className="admin-mode">{orders.length} Bestellungen insgesamt</p>
      </header>

      {orders.length === 0 ? (
        <p className="admin-empty">Noch keine Bestellungen — still wie ein Dojo am Morgen.</p>
      ) : (
        <div className="admin-orders">
          {orders.map((o) => (
            <details className="admin-order" key={o.id}>
              <summary data-hover>
                <code>{o.id}</code>
                <span className="ao-name">{o.name}</span>
                <span className="ao-items">{o.items.reduce((s, i) => s + i.qty, 0)} Artikel</span>
                <span className="ao-total">{formatCHF(o.totalRappen)}</span>
                <span className={`badge badge-${o.status}`}>{STATUS_LABEL[o.status]}</span>
                <span className="ao-date">
                  {new Date(o.createdAt).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </span>
              </summary>
              <div className="ao-detail">
                <div className="ao-cols">
                  <div>
                    <h3>Artikel</h3>
                    <ul>
                      {o.items.map((i, idx) => (
                        <li key={idx}>
                          {i.qty}× {i.name} · Grösse {i.size} — {formatCHF(i.priceRappen * i.qty)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Lieferadresse</h3>
                    <p>
                      {o.name}
                      <br />
                      {o.street}
                      <br />
                      {o.zip} {o.city}
                    </p>
                    <p className="ao-email">{o.email}</p>
                  </div>
                </div>
                <div className="ao-actions">
                  {(["paid", "shipped", "cancelled"] as OrderStatus[])
                    .filter((s) => s !== o.status)
                    .map((s) => (
                      <form action={setOrderStatusAction} key={s}>
                        <input type="hidden" name="id" value={o.id} />
                        <input type="hidden" name="status" value={s} />
                        <button type="submit" className="btn-ghost btn-small" data-hover>
                          → {STATUS_LABEL[s]}
                        </button>
                      </form>
                    ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </main>
  );
}
