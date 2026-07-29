"use client";

import { useRef, useState } from "react";

/**
 * Bilder werden vor dem Upload im Browser verkleinert (max. 1600 px, JPEG) —
 * grosse Design-PNGs (20–30 MB) würden sonst am 4.5-MB-Limit von Vercel scheitern.
 */
const MAX_EDGE = 1600;
const PASSTHROUGH_BYTES = 1_500_000; // kleine Dateien unverändert lassen

async function prepareFile(file: File): Promise<File> {
  if (file.size <= PASSTHROUGH_BYTES) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // Weisser Grund, falls das PNG Transparenz hat (JPEG kennt keine)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file; // im Zweifel Original versuchen
  }
}

/** Lädt eine Datei hoch und meldet die URL zurück (Storage bzw. lokal). */
export default function ImageUploader({
  onUploaded,
  label = "Bild hochladen",
}: {
  onUploaded: (url: string) => void | Promise<void>;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      for (const original of Array.from(files)) {
        const file = await prepareFile(original);
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        let data: { url?: string; error?: string } = {};
        try {
          data = await res.json();
        } catch {
          // Kein JSON (z. B. Plattform-Fehlerseite) — Status unten auswerten
        }
        if (!res.ok || !data.url) {
          throw new Error(
            data.error ||
              (res.status === 413
                ? "Datei zu gross für den Upload"
                : `Upload fehlgeschlagen (HTTP ${res.status})`)
          );
        }
        await onUploaded(data.url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload fehlgeschlagen");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <span className="img-uploader">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        className="btn-ghost btn-small"
        data-hover
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Lädt hoch …" : label}
      </button>
      {error && <span className="img-uploader-error">{error}</span>}
    </span>
  );
}
