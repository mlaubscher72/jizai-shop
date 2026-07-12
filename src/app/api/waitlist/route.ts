import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  let email = "";
  try {
    const body = await req.json();
    email = String(body.email || "").trim();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Ungültige E-Mail" }, { status: 400 });
  }
  const added = await db.addToWaitlist(email);
  return NextResponse.json({ ok: true, added });
}
