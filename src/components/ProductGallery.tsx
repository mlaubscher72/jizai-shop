"use client";

import { useState } from "react";

export default function ProductGallery({
  images,
  alt,
  kanji,
  badge,
}: {
  images: string[];
  alt: string;
  kanji: string;
  badge?: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="product-media">
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt={alt} />
      ) : (
        <div className="ap-noimg product-noimg"><span>{kanji}</span></div>
      )}
      <span className="product-kanji-wm" aria-hidden="true">{kanji}</span>
      {badge && <span className="piece-badge is-ha product-ha-badge">{badge}</span>}

      {images.length > 1 && (
        <div className="pg-thumbs" role="tablist" aria-label="Produktbilder">
          {images.map((url, i) => (
            <button
              key={url}
              role="tab"
              aria-selected={i === active}
              className={`pg-thumb${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
              data-hover
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${alt} — Bild ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
