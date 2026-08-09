import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/**
 * TOTP nach RFC 6238 (HMAC-SHA1, 30-Sekunden-Fenster, 6 Stellen) —
 * kompatibel mit Google Authenticator, 1Password, Authy, Microsoft Authenticator.
 * Bewusst ohne externe Abhängigkeit implementiert.
 */

const DIGITS = 6;
const PERIOD = 30; // Sekunden
const WINDOW = 1; // ±1 Schritt Toleranz für ungenaue Uhren

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateSecret(): string {
  const bytes = randomBytes(20); // 160 Bit, RFC-Empfehlung
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    out += B32[parseInt(bits.slice(i, i + 5), 2)];
  }
  return out;
}

function base32Decode(secret: string): Buffer {
  const clean = secret.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const c of clean) {
    const idx = B32.indexOf(c);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function codeForCounter(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

/** Prüft einen eingegebenen Code gegen das Secret (mit Zeittoleranz). */
export function verifyTotp(secret: string, input: string): boolean {
  const code = input.replace(/\D/g, "");
  if (code.length !== DIGITS || !secret) return false;
  const counter = Math.floor(Date.now() / 1000 / PERIOD);
  for (let w = -WINDOW; w <= WINDOW; w++) {
    const expected = codeForCounter(secret, counter + w);
    try {
      if (timingSafeEqual(Buffer.from(expected), Buffer.from(code))) return true;
    } catch {
      /* Längen ungleich — kein Treffer */
    }
  }
  return false;
}

/** otpauth-URL für den QR-Code der Authenticator-App. */
export function otpauthUrl(secret: string, account: string, issuer = "JIZAI"): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(PERIOD),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/** Secret in Vierergruppen — erleichtert die manuelle Eingabe. */
export function formatSecret(secret: string): string {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}
