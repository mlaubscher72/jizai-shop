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

const isProd = process.env.NODE_ENV === "production";

/**
 * Signaturschlüssel der Session. In Produktion gibt es KEINEN Standardwert:
 * Mit einem bekannten Schlüssel liesse sich ein Admin-Cookie fälschen —
 * also lieber hart scheitern als still unsicher laufen.
 */
function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (isProd) {
    throw new Error(
      "ADMIN_SESSION_SECRET fehlt oder ist zu kurz (min. 16 Zeichen). Admin-Login ist deaktiviert."
    );
  }
  return "jizai-dev-secret-only-for-local-development";
}

/**
 * Root-Login (E-Mail-Feld leer). Bevorzugt ADMIN_PASSWORD_HASH (scrypt) —
 * dann liegt in der Umgebung kein direkt verwendbares Passwort mehr.
 * ADMIN_PASSWORD im Klartext wird weiter unterstützt, ist aber die schwächere Variante.
 * Mit ADMIN_ROOT_LOGIN=off lässt sich der Zugang ganz abschalten.
 */
export function rootLoginEnabled(): boolean {
  if (process.env.ADMIN_ROOT_LOGIN === "off") return false;
  return Boolean(process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || !isProd);
}

export function verifyRootPassword(password: string): boolean {
  if (!rootLoginEnabled() || !password) return false;

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return verifyPassword(password, hash);

  const plain = process.env.ADMIN_PASSWORD;
  if (plain) {
    // Konstantzeit-Vergleich, damit die Antwortdauer nichts über das Passwort verrät
    const a = Buffer.from(password);
    const b = Buffer.from(plain);
    if (a.length !== b.length) return false;
    try {
      return timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  // Nur lokal ohne jede Konfiguration nutzbar — in Produktion nie erreichbar
  return !isProd && password === "jizai-local-dev";
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
    // Nur über HTTPS senden — verhindert Mitlesen des Cookies im Klartext
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
  store.delete(PENDING_COOKIE);
}

/* ---------- Zwischenschritt für 2FA ---------- */

const PENDING_COOKIE = "jizai_2fa";
const PENDING_MINUTES = 5;

/**
 * Nach korrektem Passwort, aber vor dem 2FA-Code: kurzlebiger, signierter
 * Marker. Er allein gibt keinen Zugriff — nur die Berechtigung, den Code
 * einzugeben.
 */
export async function setPendingTotp(email: string): Promise<void> {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + PENDING_MINUTES * 60_000 })
  ).toString("base64url");
  const store = await cookies();
  store.set(PENDING_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_MINUTES * 60,
  });
}

export async function getPendingTotp(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(PENDING_COOKIE)?.value;
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(sign(payload)))) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.exp > Date.now() ? (data.email as string) : null;
  } catch {
    return null;
  }
}

export async function clearPendingTotp(): Promise<void> {
  const store = await cookies();
  store.delete(PENDING_COOKIE);
}
