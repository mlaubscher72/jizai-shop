import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { AdminRole } from "./types";

const COOKIE = "jizai_admin";
const SESSION_HOURS = 12;

export interface AdminSession {
  email: string;
  name: string;
  role: AdminRole;
  exp: number;
}

const ROLE_RANK: Record<AdminRole, number> = { viewer: 1, manager: 2, admin: 3 };

export function roleAtLeast(role: AdminRole, min: AdminRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "jizai-dev-secret-change-me";
}

/** Root-Fallback: Login mit dem ADMIN_PASSWORD aus der Umgebung (immer Rolle admin). */
export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "jizai2026";
}

/* ---------- Passwort-Hashing (scrypt, ohne externe Dependency) ---------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 32);
  try {
    return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

/* ---------- Session-Token (HMAC-signiert) ---------- */

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createSessionToken(session: Omit<AdminSession, "exp">): string {
  const full: AdminSession = { ...session, exp: Date.now() + SESSION_HOURS * 3600 * 1000 };
  const payload = Buffer.from(JSON.stringify(full)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(sign(payload)))) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as AdminSession;
    if (session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

/* ---------- Server-Helper ---------- */

export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return parseSessionToken(store.get(COOKIE)?.value);
}

export async function isAdmin(): Promise<boolean> {
  return (await getSession()) !== null;
}

export async function setAdminCookie(session: Omit<AdminSession, "exp">): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, createSessionToken(session), {
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
