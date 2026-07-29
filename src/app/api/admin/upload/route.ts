import { NextResponse } from "next/server";
import { getSession, roleAtLeast } from "@/lib/auth";
import { saveProductImage } from "@/lib/storage";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !roleAtLeast(session.role, "manager")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei erhalten" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Nur JPG, PNG oder WebP" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Datei zu gross (max. 8 MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await saveProductImage(buffer, file.name, file.type);
  return NextResponse.json({ url });
}
