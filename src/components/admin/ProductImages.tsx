"use client";

import ImageUploader from "./ImageUploader";
import {
  addProductImageAction,
  makePrimaryImageAction,
  removeProductImageAction,
} from "@/app/admin/actions";

/** Galerie-Verwaltung eines bestehenden Produkts (Upload, Hauptbild, Entfernen). */
export default function ProductImages({
  productId,
  images,
}: {
  productId: string;
  images: string[];
}) {
  async function attach(url: string) {
    const fd = new FormData();
    fd.append("id", productId);
    fd.append("url", url);
    await addProductImageAction(fd);
  }

  async function run(action: (fd: FormData) => Promise<void>, url: string) {
    const fd = new FormData();
    fd.append("id", productId);
    fd.append("url", url);
    await action(fd);
  }

  return (
    <div className="pi-wrap">
      <div className="pi-grid">
        {images.map((url, i) => (
          <figure className={`pi-thumb${i === 0 ? " is-primary" : ""}`} key={url}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" />
            {i === 0 && <figcaption>Hauptbild</figcaption>}
            <div className="pi-actions">
              {i !== 0 && (
                <button type="button" data-hover title="Zum Hauptbild machen"
                  onClick={() => run(makePrimaryImageAction, url)}>
                  ★
                </button>
              )}
              <button type="button" data-hover title="Bild entfernen"
                onClick={() => run(removeProductImageAction, url)}>
                ×
              </button>
            </div>
          </figure>
        ))}
        {images.length === 0 && <p className="pi-empty">Noch keine Bilder.</p>}
      </div>
      <ImageUploader onUploaded={attach} label="+ Bild hochladen" />
    </div>
  );
}
