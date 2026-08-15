import Link from "next/link";
import { db } from "@/lib/db";
import { reconcileOrderWithStripe } from "@/lib/stripe-sync";
import { formatCHF } from "@/lib/types";
import { Lang, localePath, t } from "@/lib/i18n";

export default async function SuccessView({
  lang,
  orderId,
}: {
  lang: Lang;
  orderId?: string;
}) {
  const d = t(lang);
  const raw = orderId ? await db.getOrder(orderId) : null;
  // Fällt der Webhook aus oder ist verzögert: direkt bei Stripe nachfragen
  const order = raw ? await reconcileOrderWithStripe(raw) : null;

  return (
    <main className="success-page">
      <div className="success-inner">
        <span className="success-seal">自在</span>
        <p className="section-label"><span>{d.successLabel}</span></p>
        <h1>{d.successTitle}</h1>
        <p className="success-sub">{d.successSub}</p>

        {order && (
          <div className="success-order">
            <p className="so-id">{d.successOrder} <strong>{order.id}</strong></p>
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>
                  <span>{d.successItem(item.name, item.size, item.qty)}</span>
                  <span>{formatCHF(item.priceRappen * item.qty)}</span>
                </li>
              ))}
              <li className="so-total">
                <span>{d.successTotal}</span>
                <strong>{formatCHF(order.totalRappen)}</strong>
              </li>
            </ul>
          </div>
        )}

        <Link href={localePath(lang, "/")} className="btn-ghost" data-hover>
          {d.backHome}
        </Link>
      </div>
    </main>
  );
}
