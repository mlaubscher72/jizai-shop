"use client";

import { useRef, useState } from "react";

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
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload fehlgeschlagen");
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
