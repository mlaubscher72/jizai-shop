import Link from "next/link";
import { db } from "@/lib/db";
import { formatCHF } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderIdParam } = await searchParams;
  const order = orderIdParam ? await db.getOrder(orderIdParam) : null;

  return (
    <main className="success-page">
      <div className="success-inner">
        <span className="success-seal">自在</span>
        <p className="section-label"><span>ありがとう — Danke</span></p>
        <h1>Deine Bestellung ist da.</h1>
        <p className="success-sub">
          Begin before the noise — wir packen dein Stück mit Ruhe und Sorgfalt. Du erhältst eine Bestätigung per
          E-Mail.
        </p>

        {order && (
          <div className="success-order">
            <p className="so-id">Bestellung <strong>{order.id}</strong></p>
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>
                  <span>{item.name} · Grösse {item.size} · {item.qty}×</span>
                  <span>{formatCHF(item.priceRappen * item.qty)}</span>
                </li>
              ))}
              <li className="so-total">
                <span>Total inkl. Versand</span>
                <strong>{formatCHF(order.totalRappen)}</strong>
              </li>
            </ul>
          </div>
        )}

        <Link href="/" className="btn-ghost" data-hover>
          Zurück zur Startseite
        </Link>
      </div>
    </main>
  );
}
