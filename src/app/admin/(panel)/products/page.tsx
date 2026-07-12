import { db } from "@/lib/db";
import { getSession, roleAtLeast } from "@/lib/auth";
import { updateProductAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const products = await db.getProducts();
  const session = await getSession();
  const canEdit = session ? roleAtLeast(session.role, "manager") : false;

  return (
    <main className="admin-content">
      <header className="admin-head">
        <h1>Produkte</h1>
        <p className="admin-mode">
          {canEdit
            ? "Preis, Bestände und Sichtbarkeit — Änderungen wirken sofort im Shop."
            : "Nur-Lese-Zugriff — zum Bearbeiten braucht es die Rolle Manager oder Admin."}
        </p>
      </header>

      <div className="admin-products">
        {products.map((p) => (
          <form action={updateProductAction} className="admin-product" key={p.id}>
            <input type="hidden" name="id" value={p.id} />
            <fieldset disabled={!canEdit} className="ap-fieldset">
            <div className="ap-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} />
            </div>
            <div className="ap-body">
              <div className="ap-title">
                <h2>
                  {p.name} <em>{p.kanji}</em> <span>— {p.subtitle}</span>
                </h2>
                <label className="ap-active">
                  <input type="checkbox" name="active" defaultChecked={p.active} />
                  <span>Im Shop sichtbar</span>
                </label>
              </div>

              <div className="ap-fields">
                <label className="ap-price">
                  <span>Preis (CHF)</span>
                  <input
                    type="number"
                    name="price"
                    step="0.05"
                    min="0"
                    defaultValue={(p.priceRappen / 100).toFixed(2)}
                  />
                </label>
                {p.variants.map((v) => (
                  <label key={v.size} className={v.stock <= 5 ? "is-low" : undefined}>
                    <span>Bestand {v.size}</span>
                    <input type="number" name={`stock_${v.size}`} min="0" defaultValue={v.stock} />
                  </label>
                ))}
              </div>

              <div className="ap-foot">
                <span className="ap-sum">
                  Total {p.variants.reduce((s, v) => s + v.stock, 0)} Stück
                </span>
                {canEdit && (
                  <button type="submit" className="btn-seal btn-small" data-hover>
                    Speichern
                  </button>
                )}
              </div>
            </div>
            </fieldset>
          </form>
        ))}
      </div>
    </main>
  );
}
