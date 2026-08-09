import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Zugang zu einer Bestellung ohne Kundenkonto.
 *
 * Nach erfolgreicher Prüfung von E-Mail + Bestellnummer wird ein signierter,
 * kurzlebiger Cookie gesetzt. Die Bestellnummer landet damit nicht in der URL —
 * ein versehentlich geteilter Link gibt niemandem Einblick.
 */

const COOKIE = "jizai_order";
const VALID_MINUTES = 30;

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET fehlt — Bestellverfolgung deaktiviert.");
  }
  return "jizai-dev-secret-only-for-local-development";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export async function grantOrderAccess(orderId: string): Promise<void> {
  const payload = Buffer.from(
    JSON.stringify({ id: orderId, exp: Date.now() + VALID_MINUTES * 60_000 })
  ).toString("base64url");
  const store = await cookies();
  store.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VALID_MINUTES * 60,
  });
}

export async function getGrantedOrderId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(sign(payload)))) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.exp > Date.now() ? (data.id as string) : null;
  } catch {
    return null;
  }
}

export async function revokeOrderAccess(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
