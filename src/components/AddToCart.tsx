"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import { formatCHF, Product, Size } from "@/lib/types";
import { Lang, t } from "@/lib/i18n";

export default function AddToCart({ product, lang }: { product: Product; lang: Lang }) {
  const d = t(lang);
  const { add } = useCart();
  const [size, setSize] = useState<Size | null>(null);
  const [hint, setHint] = useState(false);

  const selected = product.variants.find((v) => v.size === size);
  const soldOut = product.variants.every((v) => v.stock <= 0);

  function handleAdd() {
    if (!size || !selected || selected.stock <= 0) {
      setHint(true);
      setTimeout(() => setHint(false), 1400);
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      kanji: product.kanji,
      image: product.images[0] ?? "",
      size,
      priceRappen: product.priceRappen,
    });
  }

  return (
    <div className="atc">
      <div className="atc-sizes" role="radiogroup" aria-label={d.sizeGroupAria}>
        {product.variants.map((v) => (
          <button
            key={v.size}
            role="radio"
            aria-checked={size === v.size}
            className={`atc-size${size === v.size ? " is-active" : ""}`}
            disabled={v.stock <= 0}
            onClick={() => setSize(v.size)}
            data-hover
          >
            {v.size}
            {v.stock <= 0 && <s aria-hidden="true"></s>}
          </button>
        ))}
      </div>

      <p className={`atc-hint${hint ? " is-visible" : ""}`}>
        {soldOut ? d.soldOutHint : d.sizeHint}
      </p>

      {selected && selected.stock <= 5 && selected.stock > 0 && (
        <p className="atc-low">{d.lowStock(selected.stock, selected.size)}</p>
      )}

      <button className="btn-seal atc-btn" onClick={handleAdd} disabled={soldOut} data-hover>
        {soldOut ? d.soldOut : d.addToCart(formatCHF(product.priceRappen))}
        {!soldOut && <span className="btn-kana" title="籠 kago — Korb">籠</span>}
      </button>
    </div>
  );
}
