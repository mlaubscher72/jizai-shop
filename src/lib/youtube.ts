/**
 * Reine Hilfsfunktion ohne Abhängigkeiten — bewusst nicht in settings.ts,
 * damit sie ohne Datenbank-Modul testbar bleibt.
 */

/**
 * Akzeptiert alles, was man aus YouTube herauskopiert — watch-Link, youtu.be,
 * Shorts, Embed oder die blanke ID. Gibt die 11-stellige ID zurück oder null.
 */
export function parseYoutubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^[\w-]{11}$/.test(raw)) return raw;

  const patterns = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/live\/([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = raw.match(p);
    if (m) return m[1];
  }
  return null;
}
