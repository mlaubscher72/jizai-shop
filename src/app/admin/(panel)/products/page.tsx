import { db } from "@/lib/db";
import { getSession, roleAtLeast } from "@/lib/auth";
import { actOf } from "@/lib/types";
import { deleteProductAction, updateProductAction } from "../../actions";
import NewProductForm from "@/components/admin/NewProductForm";
import ProductImages from "@/components/admin/ProductImages";

export const dynamic = "force-dynamic";

const ACT_OPTIONS = [
  { value: "shu", label: "守 SHU — bestellbar" },
  { value: "ha", label: "破 HA — bald" },
  { value: "ri", label: "離 RI — Horizont" },
];

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
            ? "Kategorie, Preis, Bestände, Bilder und Sichtbarkeit — Änderungen wirken sofort im Shop."
            : "Nur-Lese-Zugriff — zum Bearbeiten braucht es die Rolle Manager oder Admin."}
        </p>
      </header>

      {canEdit && <NewProductForm />}

      <div className="admin-products">
        {products.map((p) => (
          <div className="admin-product" key={p.id}>
            <div className="ap-media">
              {p.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0]} alt={p.name} />
              ) : (
                <div className="ap-noimg">
                  <span>{p.kanji}</span>
                </div>
              )}
            </div>
            <div className="ap-body">
              <form action={updateProductAction}>
                <input type="hidden" name="id" value={p.id} />
                <fieldset disabled={!canEdit} className="ap-fieldset">
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
                    <label>
                      <span>Kategorie</span>
                      <select name="act" defaultValue={actOf(p)}>
                        {ACT_OPTIONS.map((a) => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </select>
                    </label>
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

                  <label className="ap-desc">
                    <span>Beschreibung</span>
                    <textarea name="description" rows={2} defaultValue={p.description} />
                  </label>

                  <div className="ap-foot">
                    <span className="ap-sum">
                      Total {p.variants.reduce((s, v) => s + v.stock, 0)} Stück · /product/{p.slug}
                    </span>
                    {canEdit && (
                      <button type="submit" className="btn-seal btn-small" data-hover>
                        Speichern
                      </button>
                    )}
                  </div>
                </fieldset>
              </form>

              {canEdit && (
                <>
                  <ProductImages productId={p.id} images={p.images} />
                  <form action={deleteProductAction} className="ap-delete-form">
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="au-delete" data-hover>
                      Produkt löschen
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
