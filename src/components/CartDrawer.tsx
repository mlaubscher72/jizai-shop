"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { formatCHF } from "@/lib/types";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, totalRappen } = useCart();

  return (
    <>
      <div
        className={`drawer-veil${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside className={`drawer${open ? " is-open" : ""}`} aria-label="Warenkorb">
        <div className="drawer-head">
          <h2>
            Warenkorb <span className="drawer-kana">かご</span>
          </h2>
          <button className="drawer-close" data-hover onClick={() => setOpen(false)} aria-label="Schliessen">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <span className="drawer-empty-kanji">静</span>
            <p>Noch still hier drin.</p>
            <Link href="/#drop" className="btn-ghost" data-hover onClick={() => setOpen(false)}>
              Drop 01 ansehen
            </Link>
          </div>
        ) : (
          <>
            <ul className="drawer-items">
              {items.map((item) => (
                <li key={`${item.productId}-${item.size}`} className="drawer-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} />
                  <div className="drawer-item-info">
                    <p className="drawer-item-name">
                      {item.name} <em>{item.kanji}</em>
                    </p>
                    <p className="drawer-item-meta">Grösse {item.size}</p>
                    <div className="drawer-qty">
                      <button data-hover onClick={() => setQty(item.productId, item.size, item.qty - 1)} aria-label="Menge verringern">−</button>
                      <span>{item.qty}</span>
                      <button data-hover onClick={() => setQty(item.productId, item.size, item.qty + 1)} aria-label="Menge erhöhen">+</button>
                    </div>
                  </div>
                  <div className="drawer-item-right">
                    <span className="drawer-item-price">{formatCHF(item.priceRappen * item.qty)}</span>
                    <button className="drawer-remove" data-hover onClick={() => remove(item.productId, item.size)}>
                      Entfernen
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              <div className="drawer-total">
                <span>Zwischensumme</span>
                <strong>{formatCHF(totalRappen)}</strong>
              </div>
              <p className="drawer-note">Versand wird beim Checkout berechnet · CH-Versand CHF 9.–</p>
              <Link href="/checkout" className="btn-seal" data-hover onClick={() => setOpen(false)}>
                Zur Kasse <span className="btn-kana">結</span>
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
