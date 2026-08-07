/**
 * Brute-Force-Schutz für den Admin-Login.
 *
 * Zählt Fehlversuche pro Schlüssel (IP + Kennung) und sperrt zunehmend länger.
 * Bewusst ohne externe Abhängigkeit: der Speicher lebt pro Server-Instanz.
 * Auf Vercel kann ein Angreifer über viele Instanzen theoretisch mehr Versuche
 * bekommen als das Limit vorgibt — gegen automatisiertes Durchprobieren
 * (der realistische Fall) wirkt es trotzdem, weil Instanzen wiederverwendet werden.
 */

interface Entry {
  fails: number;
  blockedUntil: number;
  seen: number;
}

const attempts = new Map<string, Entry>();

const MAX_FAILS = 5; // danach beginnt die Sperre
const BASE_BLOCK_MS = 60_000; // 1 Min, verdoppelt sich je weiterem Fehlversuch
const MAX_BLOCK_MS = 60 * 60_000; // Deckel: 1 Stunde
const FORGET_MS = 6 * 60 * 60_000; // Einträge nach 6 h vergessen

function sweep(now: number) {
  if (attempts.size < 500) return;
  for (const [key, e] of attempts) {
    if (now - e.seen > FORGET_MS) attempts.delete(key);
  }
}

/** Ist der Schlüssel gerade gesperrt? Gibt die Restdauer in Sekunden zurück. */
export function checkLocked(key: string): number {
  const e = attempts.get(key);
  if (!e) return 0;
  const remaining = e.blockedUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  sweep(now);
  const e = attempts.get(key) ?? { fails: 0, blockedUntil: 0, seen: now };
  e.fails += 1;
  e.seen = now;
  if (e.fails >= MAX_FAILS) {
    const factor = 2 ** (e.fails - MAX_FAILS);
    e.blockedUntil = now + Math.min(BASE_BLOCK_MS * factor, MAX_BLOCK_MS);
  }
  attempts.set(key, e);
}

export function recordSuccess(key: string): void {
  attempts.delete(key);
}

/** Verzögert die Antwort — verlangsamt Rateversuche zusätzlich. */
export function loginDelay(): Promise<void> {
  return new Promise((r) => setTimeout(r, 400 + Math.floor(Math.random() * 300)));
}
