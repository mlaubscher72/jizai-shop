import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "jizai_admin";
const SESSION_HOURS = 12;

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "jizai-dev-secret-change-me";
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "jizai2026";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_HOURS * 3600 * 1000;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  return Number(payload) > Date.now();
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE)?.value);
}

export async function setAdminCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
