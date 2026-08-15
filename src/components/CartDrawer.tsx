"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";
import { formatCHF } from "@/lib/types";
import { langFromPath, localePath, t } from "@/lib/i18n";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, totalRappen } = useCart();

  /* Wie die Nav sitzt die Schublade im Root-Layout — Sprache aus dem Pfad */
  const lang = langFromPath(usePathname());
  const d = t(lang);

  return (
    <>
      <div
        className={`drawer-veil${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside className={`drawer${open ? " is-open" : ""}`} aria-label={d.cartAria}>
        <div className="drawer-head">
          <h2>
            {d.cartTitle} <span className="drawer-kana" title="かご kago — Korb">かご</span>
          </h2>
          <button className="drawer-close" data-hover onClick={() => setOpen(false)} aria-label={d.cartClose}>
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <span className="drawer-empty-kanji" title="静 sei — Stille">静</span>
            <p>{d.cartEmpty}</p>
            <Link
              href={`${localePath(lang, "/")}#drop`}
              className="btn-ghost"
              data-hover
              onClick={() => setOpen(false)}
            >
              {d.cartViewDrop}
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
                    <p className="drawer-item-meta">{d.cartSize} {item.size}</p>
                    <div className="drawer-qty">
                      <button data-hover onClick={() => setQty(item.productId, item.size, item.qty - 1)} aria-label={d.cartQtyDown}>−</button>
                      <span>{item.qty}</span>
                      <button data-hover onClick={() => setQty(item.productId, item.size, item.qty + 1)} aria-label={d.cartQtyUp}>+</button>
                    </div>
                  </div>
                  <div className="drawer-item-right">
                    <span className="drawer-item-price">{formatCHF(item.priceRappen * item.qty)}</span>
                    <button className="drawer-remove" data-hover onClick={() => remove(item.productId, item.size)}>
                      {d.cartRemove}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              <div className="drawer-total">
                <span>{d.cartSubtotal}</span>
                <strong>{formatCHF(totalRappen)}</strong>
              </div>
              <p className="drawer-note">{d.cartShippingNote}</p>
              <Link
                href={localePath(lang, "/checkout")}
                className="btn-seal"
                data-hover
                onClick={() => setOpen(false)}
              >
                {d.cartCheckout} <span className="btn-kana" title="結 musubi — verbinden">結</span>
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
