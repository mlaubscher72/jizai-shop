"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatCHF } from "@/lib/types";

const SHIPPING_RAPPEN = 900;

function CheckoutInner() {
  const { items, totalRappen, clear } = useCart();
  const router = useRouter();
  const search = useSearchParams();
  const cancelled = search.get("cancelled") === "1";

  const [form, setForm] = useState({ email: "", name: "", street: "", zip: "", city: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty })),
          customer: form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Etwas ist schiefgelaufen");
      if (data.mode === "stripe" && data.url) {
        clear();
        window.location.href = data.url;
        return;
      }
      clear();
      router.push(`/checkout/success?order=${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etwas ist schiefgelaufen");
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <span className="drawer-empty-kanji">静</span>
          <h1>Dein Warenkorb ist leer.</h1>
          <Link href="/#drop" className="btn-seal" data-hover>
            Drop 01 ansehen
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-grid">
        <section className="checkout-form-col">
          <p className="section-label"><span>Checkout · 結</span></p>
          <h1>Fast geschafft.</h1>
          {cancelled && <p className="checkout-error">Zahlung abgebrochen — dein Warenkorb wartet noch.</p>}

          <form onSubmit={submit} className="checkout-form">
            <label>
              <span>E-Mail</span>
              <input type="email" required value={form.email} onChange={set("email")} autoComplete="email" placeholder="deine@email.ch" />
            </label>
            <label>
              <span>Name</span>
              <input type="text" required value={form.name} onChange={set("name")} autoComplete="name" placeholder="Vor- und Nachname" />
            </label>
            <label>
              <span>Strasse &amp; Nr.</span>
              <input type="text" required value={form.street} onChange={set("street")} autoComplete="street-address" placeholder="Musterstrasse 1" />
            </label>
            <div className="checkout-row">
              <label>
                <span>PLZ</span>
                <input type="text" required value={form.zip} onChange={set("zip")} autoComplete="postal-code" placeholder="4410" />
              </label>
              <label>
                <span>Ort</span>
                <input type="text" required value={form.city} onChange={set("city")} autoComplete="address-level2" placeholder="Liestal" />
              </label>
            </div>

            {error && <p className="checkout-error">{error}</p>}

            <button type="submit" className="btn-seal checkout-submit" disabled={busy} data-hover>
              {busy ? "Einen Atemzug …" : `Bezahlen — ${formatCHF(totalRappen + SHIPPING_RAPPEN)}`}
            </button>
            <p className="checkout-hint">
              Zahlung via Stripe (TWINT, Karte, Apple Pay) — ohne konfigurierten Stripe-Key läuft der Shop im
              Demo-Modus und simuliert die Zahlung.
            </p>
          </form>
        </section>

        <aside className="checkout-summary">
          <h2>Bestellung</h2>
          <ul>
            {items.map((item) => (
              <li key={`${item.productId}-${item.size}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} />
                <div>
                  <p>{item.name} <em>{item.kanji}</em></p>
                  <p className="cs-meta">Grösse {item.size} · {item.qty}×</p>
                </div>
                <span>{formatCHF(item.priceRappen * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="cs-line"><span>Zwischensumme</span><span>{formatCHF(totalRappen)}</span></div>
          <div className="cs-line"><span>Versand (CH)</span><span>{formatCHF(SHIPPING_RAPPEN)}</span></div>
          <div className="cs-line cs-total"><span>Total</span><strong>{formatCHF(totalRappen + SHIPPING_RAPPEN)}</strong></div>
        </aside>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutInner />
    </Suspense>
  );
}
