"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatCHF } from "@/lib/types";
import { Lang, localePath, t } from "@/lib/i18n";

const SHIPPING_RAPPEN = 900;

function CheckoutInner({ lang }: { lang: Lang }) {
  const d = t(lang);
  const { items, totalRappen, clear } = useCart();
  const router = useRouter();
  const search = useSearchParams();
  const cancelled = search.get("cancelled") === "1";

  const [form, setForm] = useState({ email: "", name: "", street: "", zip: "", city: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  /* Kommt der Kunde über "Nochmals bestellen", ist die Adresse schon bekannt */
  const [prefilled, setPrefilled] = useState(false);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("jizai_prefill");
      if (!raw) return;
      const a = JSON.parse(raw);
      setForm((f) => ({
        email: a.email ?? f.email,
        name: a.name ?? f.name,
        street: a.street ?? f.street,
        zip: a.zip ?? f.zip,
        city: a.city ?? f.city,
      }));
      setPrefilled(true);
      sessionStorage.removeItem("jizai_prefill");
    } catch {}
  }, []);

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
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Die API liefert einen sprachneutralen Code; der Text kommt aus dem Wörterbuch
        const code = String(data.code || "unknown");
        throw new Error(
          code === "not_orderable" && data.product
            ? d.errNotOrderable(data.product)
            : d.errors[code] ?? d.errors.unknown
        );
      }
      if (data.mode === "stripe" && data.url) {
        clear();
        window.location.href = data.url;
        return;
      }
      clear();
      router.push(`${localePath(lang, "/checkout/success")}?order=${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.errors.unknown);
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <span className="drawer-empty-kanji" title="静 sei — Stille">静</span>
          <h1>{d.checkoutEmpty}</h1>
          <Link href={`${localePath(lang, "/")}#drop`} className="btn-seal" data-hover>
            {d.cartViewDrop}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-grid">
        <section className="checkout-form-col">
          <p className="section-label"><span>{d.checkoutLabel}</span></p>
          <h1>{d.checkoutTitle}</h1>
          {cancelled && <p className="checkout-error">{d.checkoutCancelled}</p>}
          {prefilled && <p className="checkout-prefill">{d.checkoutPrefilled}</p>}

          <form onSubmit={submit} className="checkout-form">
            <label>
              <span>{d.fEmail}</span>
              <input type="email" required value={form.email} onChange={set("email")} autoComplete="email" placeholder={d.phEmail} />
            </label>
            <label>
              <span>{d.fName}</span>
              <input type="text" required value={form.name} onChange={set("name")} autoComplete="name" placeholder={d.phName} />
            </label>
            <label>
              <span>{d.fStreet}</span>
              <input type="text" required value={form.street} onChange={set("street")} autoComplete="street-address" placeholder={d.phStreet} />
            </label>
            <div className="checkout-row">
              <label>
                <span>{d.fZip}</span>
                <input type="text" required value={form.zip} onChange={set("zip")} autoComplete="postal-code" placeholder={d.phZip} />
              </label>
              <label>
                <span>{d.fCity}</span>
                <input type="text" required value={form.city} onChange={set("city")} autoComplete="address-level2" placeholder={d.phCity} />
              </label>
            </div>

            {error && <p className="checkout-error">{error}</p>}

            <button type="submit" className="btn-seal checkout-submit" disabled={busy} data-hover>
              {busy ? d.checkoutBusy : d.checkoutPay(formatCHF(totalRappen + SHIPPING_RAPPEN))}
            </button>
            <p className="checkout-hint">{d.checkoutHint}</p>
          </form>
        </section>

        <aside className="checkout-summary">
          <h2>{d.summaryTitle}</h2>
          <ul>
            {items.map((item) => (
              <li key={`${item.productId}-${item.size}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} />
                <div>
                  <p>{item.name} <em>{item.kanji}</em></p>
                  <p className="cs-meta">{d.summarySize(item.size, item.qty)}</p>
                </div>
                <span>{formatCHF(item.priceRappen * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="cs-line"><span>{d.summarySubtotal}</span><span>{formatCHF(totalRappen)}</span></div>
          <div className="cs-line"><span>{d.summaryShipping}</span><span>{formatCHF(SHIPPING_RAPPEN)}</span></div>
          <div className="cs-line cs-total"><span>{d.summaryTotal}</span><strong>{formatCHF(totalRappen + SHIPPING_RAPPEN)}</strong></div>
        </aside>
      </div>
    </main>
  );
}

export default function CheckoutView({ lang }: { lang: Lang }) {
  return (
    <Suspense>
      <CheckoutInner lang={lang} />
    </Suspense>
  );
}
