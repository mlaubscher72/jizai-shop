import Link from "next/link";
import { db } from "@/lib/db";
import { getGrantedOrderId } from "@/lib/order-access";
import { isOrderable } from "@/lib/seed";
import { CartItem, formatCHF, OrderStatus, Size } from "@/lib/types";
import { reconcileOrderWithStripe } from "@/lib/stripe-sync";
import { Lang, localePath, t } from "@/lib/i18n";
import ReorderButton from "@/components/ReorderButton";
import Footer from "@/components/Footer";
import { closeOrderAction, lookupOrderAction } from "@/app/bestellung/actions";

/* Badge-Farbe hängt am Status, nicht an der Sprache */
const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "badge-pending",
  paid: "badge-paid",
  shipped: "badge-shipped",
  cancelled: "badge-cancelled",
};

export default async function OrderView({
  lang,
  error,
  locked,
}: {
  lang: Lang;
  error?: string;
  locked?: string;
}) {
  const d = t(lang);
  const lockedSeconds = Number(locked) || 0;

  const grantedId = await getGrantedOrderId();
  const raw = grantedId ? await db.getOrder(grantedId) : null;
  const order = raw ? await reconcileOrderWithStripe(raw) : null;

  /* ---------- Bestellung gefunden ---------- */
  if (order) {
    const status = d.status[order.status];
    const products = await db.getProducts();

    // Nur Artikel erneut anbieten, die es noch gibt und die bestellbar sind
    const reorderItems: (Omit<CartItem, "qty"> & { qty: number })[] = [];
    let skipped = 0;
    for (const item of order.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.active || !isOrderable(product)) {
        skipped++;
        continue;
      }
      reorderItems.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        kanji: product.kanji,
        image: product.images[0] ?? "",
        size: item.size as Size,
        priceRappen: product.priceRappen,
        qty: item.qty,
      });
    }

    const itemsTotal = order.items.reduce((s, i) => s + i.qty * i.priceRappen, 0);
    const shipping = order.totalRappen - itemsTotal;

    return (
      <>
        <main className="order-page">
          <div className="order-inner">
            <p className="section-label"><span>{d.orderIdLabel(order.id)}</span></p>
            <h1 className="order-title">{status.label}</h1>
            <p className="order-status-note">{status.note}</p>

            <div className="ord-meta">
              <span className={`badge ${STATUS_BADGE[order.status]}`}>{status.label}</span>
              <span className="ord-date">
                {d.orderedOn}{" "}
                {new Date(order.createdAt).toLocaleDateString(d.locale, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>

            <section className="ord-section">
              <h2 className="ord-head">{d.orderItems}</h2>
              <ul className="ord-items">
                {order.items.map((item, i) => (
                  <li key={i}>
                    <div>
                      <p className="ord-item-name">{item.name}</p>
                      <p className="ord-item-meta">{d.orderSize(item.size, item.qty)}</p>
                    </div>
                    <span>{formatCHF(item.priceRappen * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="ord-line"><span>{d.orderShipping}</span><span>{formatCHF(shipping)}</span></div>
              <div className="ord-line ord-total"><span>{d.orderTotal}</span><strong>{formatCHF(order.totalRappen)}</strong></div>
            </section>

            <section className="ord-section">
              <h2 className="ord-head">{d.orderAddress}</h2>
              <p className="ord-address">
                {order.name}
                <br />
                {order.street}
                <br />
                {order.zip} {order.city}
              </p>
            </section>

            {order.status !== "cancelled" && (
              <section className="ord-section">
                <ReorderButton
                  items={reorderItems}
                  skipped={skipped}
                  lang={lang}
                  address={{
                    email: order.email,
                    name: order.name,
                    street: order.street,
                    zip: order.zip,
                    city: order.city,
                  }}
                />
              </section>
            )}

            <div className="ord-foot">
              <form action={closeOrderAction}>
                <input type="hidden" name="lang" value={lang} />
                <button type="submit" className="ord-link" data-hover>
                  {d.orderClose}
                </button>
              </form>
              <Link href={localePath(lang, "/")} className="ord-link" data-hover>
                {d.orderBackHome}
              </Link>
            </div>
          </div>
        </main>
        <Footer lang={lang} />
      </>
    );
  }

  /* ---------- Suchformular ---------- */
  return (
    <>
      <main className="order-page">
        <div className="order-inner">
          <span className="order-seal" aria-hidden="true">自在</span>
          <p className="section-label"><span>{d.orderLabel}</span></p>
          <h1 className="order-title">{d.orderTitle}</h1>
          <p className="order-intro">{d.orderIntro}</p>

          <form action={lookupOrderAction} className="order-form">
            <input type="hidden" name="lang" value={lang} />
            <label>
              <span>{d.fEmail}</span>
              <input type="email" name="email" required autoComplete="email"
                placeholder={d.phEmail} />
            </label>
            <label>
              <span>{d.fOrderId}</span>
              <input type="text" name="orderId" required placeholder={d.phOrderId}
                spellCheck={false} autoCapitalize="none" />
            </label>

            {error && <p className="checkout-error">{d.orderNotFound}</p>}
            {lockedSeconds > 0 && (
              <p className="checkout-error">{d.orderLocked(Math.ceil(lockedSeconds / 60))}</p>
            )}

            <button type="submit" className="btn-seal" data-hover>
              {d.orderSubmit}
            </button>
          </form>

          <p className="order-help">
            {d.orderHelpA}{" "}
            <a href="mailto:hello@jizai.ch" data-hover>hello@jizai.ch</a> {d.orderHelpB}
          </p>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
