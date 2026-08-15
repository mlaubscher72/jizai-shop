import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Automatische Sprachwahl beim ersten Besuch.
 *
 * Nur die deutsche Startseite "/" wird umgeleitet — nie eine Unterseite.
 * Wer einen Link auf /product/… teilt, landet auch dort, wo der Link hinzeigt.
 *
 * Reihenfolge der Entscheidung:
 *   1. Cookie jizai_lang gesetzt  → eigene Wahl gewinnt, keine Umleitung
 *   2. Crawler                    → keine Umleitung, damit Google beide Fassungen sieht
 *   3. Browser bevorzugt Englisch → 307 auf /en
 *   4. sonst                      → Deutsch bleibt
 *
 * Bewusst ohne Importe aus src/lib: Proxy läuft getrennt vom Render-Code
 * (und ggf. auf dem CDN), gemeinsame Module sind hier nicht verlässlich.
 */

const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|preview|whatsapp|telegram|discord/i;

/** Bevorzugt der Browser Englisch vor Deutsch? Nur die höchstgewichtete der beiden zählt. */
function prefersEnglish(header: string): boolean {
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? parseFloat(q.split("=")[1]) || 0 : 1 };
    })
    .filter((e) => e.tag.startsWith("de") || e.tag.startsWith("en"))
    .sort((a, b) => b.q - a.q);

  return ranked[0]?.tag.startsWith("en") ?? false;
}

export function proxy(request: NextRequest) {
  if (request.cookies.has("jizai_lang")) return;

  const ua = request.headers.get("user-agent") || "";
  if (BOT.test(ua)) return;

  const accept = request.headers.get("accept-language");
  if (!accept || !prefersEnglish(accept)) return;

  const url = request.nextUrl.clone();
  url.pathname = "/en";
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: "/",
};
