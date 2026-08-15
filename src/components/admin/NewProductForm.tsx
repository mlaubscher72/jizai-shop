"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";
import { createProductAction } from "@/app/admin/actions";

const ACTS = [
  { value: "shu", label: "守 SHU" },
  { value: "ha", label: "破 HA" },
  { value: "ri", label: "離 RI" },
];

export default function NewProductForm() {
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setBusy(true);
    setError(null);
    try {
      await createProductAction(formData);
      setImages([]);
      (document.getElementById("npf") as HTMLFormElement | null)?.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Anlegen fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="npf">
      <summary data-hover>+ Neues Produkt anlegen</summary>
      <form id="npf" action={submit} className="npf-form">
        {images.map((url) => (
          <input type="hidden" name="images" value={url} key={url} />
        ))}
        <div className="npf-grid">
          <label className="npf-wide">
            <span>Name</span>
            <input type="text" name="name" required placeholder="JIZAI … TEE" />
          </label>
          <label>
            <span>Kategorie</span>
            <select name="act" defaultValue="shu">
              {ACTS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select name="orderable" defaultValue="1">
              <option value="1">Bestellbar</option>
              <option value="0">Bald verfügbar</option>
            </select>
          </label>
          <label>
            <span>Preis (CHF)</span>
            <input type="number" name="price" step="0.05" min="0" defaultValue="89.00" />
          </label>
          <label className="npf-wide">
            <span>Typ / Stoff</span>
            <input type="text" name="subtitle" defaultValue="Oversized Heavyweight Tee · 280 GSM" />
          </label>
          <label>
            <span>Startbestand pro Grösse</span>
            <input type="number" name="stock" min="0" defaultValue="20" />
          </label>
          <label className="npf-check">
            <input type="checkbox" name="active" />
            <span>Sofort im Shop sichtbar</span>
          </label>
          <label className="npf-wide">
            <span>Beschreibung (Deutsch)</span>
            <textarea name="description" rows={2} placeholder="Kurzer Produkttext …" />
          </label>
          <label className="npf-wide">
            <span>Beschreibung (English)</span>
            <textarea
              name="description_en"
              rows={2}
              placeholder="Leer lassen = englische Seite zeigt den deutschen Text"
            />
          </label>
        </div>

        <div className="npf-images">
          {images.map((url) => (
            <figure key={url}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" />
              <button type="button" data-hover onClick={() => setImages(images.filter((i) => i !== url))}>×</button>
            </figure>
          ))}
          <ImageUploader onUploaded={(url) => setImages((prev) => [...prev, url])} label="+ Bilder hochladen" />
        </div>

        {error && <p className="checkout-error">{error}</p>}
        <button type="submit" className="btn-seal btn-small" disabled={busy} data-hover>
          {busy ? "Legt an …" : "Produkt anlegen"}
        </button>
      </form>
    </details>
  );
}
