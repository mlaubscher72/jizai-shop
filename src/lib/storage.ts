import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { usingSupabase } from "./db";

const BUCKET = "product-images";

function safeName(original: string): string {
  const ext = (original.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const base = original
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "bild";
  return `${base}-${randomBytes(3).toString("hex")}.${ext}`;
}

/**
 * Produktbild speichern.
 * Supabase konfiguriert → Storage-Bucket (public, CDN).
 * Sonst (lokaler Demo-Modus) → public/uploads.
 */
export async function saveProductImage(
  buffer: Buffer,
  originalName: string,
  contentType: string
): Promise<string> {
  const name = safeName(originalName);

  if (usingSupabase) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const res = await fetch(`${base}/storage/v1/object/${BUCKET}/${name}`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": contentType || "image/jpeg",
      },
      body: new Uint8Array(buffer),
    });
    if (!res.ok) {
      throw new Error(`Upload fehlgeschlagen (${res.status}): ${await res.text()}`);
    }
    return `${base}/storage/v1/object/public/${BUCKET}/${name}`;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buffer);
  return `/uploads/${name}`;
}
