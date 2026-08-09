import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getGrantedOrderId } from "@/lib/order-access";
import { isOrderable } from "@/lib/seed";
import { CartItem, formatCHF, OrderStatus, Size } from "@/lib/types";
import { reconcileOrderWithStripe } from "@/lib/stripe-sync";
import ReorderButton from "@/components/ReorderButton";
import Footer from "@/components/Footer";
import { closeOrderAction, lookupOrderAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bestellung verfolgen — JIZAI",
  description: "Status deiner JIZAI-Bestellung ansehen und Stücke erneut bestellen.",
};

/* Kundensicht auf den Status — sachlich, ohne Werkstattjargon */
const STATUS: Record<OrderStatus, { label: string; note: string; badge: string }> = {
  pending: {
    label: "Zahlung ausstehend",
    note: "Wir haben deine Bestellung, warten aber noch auf den Zahlungseingang.",
    badge: "badge-pending",
  },
  paid: {
    label: "Bezahlt",
    note: "Zahlung eingegangen. Dein Stück wird für den Versand vorbereitet.",
    badge: "badge-paid",
  },
  shipped: {
    label: "Versendet",
    note: "Unterwegs zu dir.",
    badge: "badge-shipped",
  },
  cancelled: {
    label: "Storniert",
    note: "Diese Bestellung wurde storniert.",
    badge: "badge-cancelled",
  },
};

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; locked?: string }>;
}) {
  const { error, locked } = await searchParams;
  const lockedSeconds = Number(locked) || 0;

  const grantedId = await getGrantedOrderId();
  const raw = grantedId ? await db.getOrder(grantedId) : null;
  const order = raw ? await reconcileOrderWithStripe(raw) : null;

  /* ---------- Bestellung gefunden ---------- */
  if (order) {
    const status = STATUS[order.status];
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
            <p className="section-label"><span>Bestellung {order.id}</span></p>
            <h1 className="order-title">{status.label}</h1>
            <p className="order-status-note">{status.note}</p>

            <div className="ord-meta">
              <span className={`badge ${status.badge}`}>{status.label}</span>
              <span className="ord-date">
                Bestellt am{" "}
                {new Date(order.createdAt).toLocaleDateString("de-CH", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>

            <section className="ord-section">
              <h2 className="ord-head">Artikel</h2>
              <ul className="ord-items">
                {order.items.map((item, i) => (
                  <li key={i}>
                    <div>
                      <p className="ord-item-name">{item.name}</p>
                      <p className="ord-item-meta">Grösse {item.size} · {item.qty}×</p>
                    </div>
                    <span>{formatCHF(item.priceRappen * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="ord-line"><span>Versand</span><span>{formatCHF(shipping)}</span></div>
              <div className="ord-line ord-total"><span>Total</span><strong>{formatCHF(order.totalRappen)}</strong></div>
            </section>

            <section className="ord-section">
              <h2 className="ord-head">Lieferadresse</h2>
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
                <button type="submit" className="ord-link" data-hover>
                  Ansicht schliessen
                </button>
              </form>
              <Link href="/" className="ord-link" data-hover>← Zur Startseite</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ---------- Suchformular ---------- */
  return (
    <>
      <main className="order-page">
        <div className="order-inner">
          <span className="order-seal" aria-hidden="true">自在</span>
          <p className="section-label"><span>Bestellung verfolgen</span></p>
          <h1 className="order-title">Wo ist mein Stück?</h1>
          <p className="order-intro">
            Gib deine E-Mail und die Bestellnummer aus der Bestätigungsmail ein.
            Kein Konto nötig.
          </p>

          <form action={lookupOrderAction} className="order-form">
            <label>
              <span>E-Mail</span>
              <input type="email" name="email" required autoComplete="email"
                placeholder="deine@email.ch" />
            </label>
            <label>
              <span>Bestellnummer</span>
              <input type="text" name="orderId" required placeholder="jz_xxxxxxxx"
                spellCheck={false} autoCapitalize="none" />
            </label>

            {error && (
              <p className="checkout-error">
                Keine Bestellung gefunden. Prüfe E-Mail und Bestellnummer.
              </p>
            )}
            {lockedSeconds > 0 && (
              <p className="checkout-error">
                Zu viele Versuche. Bitte {Math.ceil(lockedSeconds / 60)} Min warten.
              </p>
            )}

            <button type="submit" className="btn-seal" data-hover>
              Bestellung anzeigen
            </button>
          </form>

          <p className="order-help">
            Nummer verlegt? Schreib uns an{" "}
            <a href="mailto:hello@jizai.ch" data-hover>hello@jizai.ch</a> — wir finden sie.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
