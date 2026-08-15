import { db } from "./db";

/**
 * Website-Einstellungen aus der Datenbank.
 * Fehlt die settings-Tabelle noch, gelten die Standardwerte —
 * die Seite läuft also auch vor der Migration normal weiter.
 */
export const COMING_SOON_KEY = "coming_soon";

export async function isComingSoon(): Promise<boolean> {
  try {
    return (await db.getSetting(COMING_SOON_KEY)) === "1";
  } catch {
    return false;
  }
}

export async function setComingSoon(active: boolean): Promise<void> {
  await db.setSetting(COMING_SOON_KEY, active ? "1" : "0");
}

/* ---------- Markenfilm auf der Teaser-Seite ---------- */

export const TEASER_VIDEO_KEY = "teaser_youtube_id";

/** Leer = kein YouTube hinterlegt, die Seite spielt dann das eigene Video. */
export async function getTeaserVideoId(): Promise<string | null> {
  try {
    return (await db.getSetting(TEASER_VIDEO_KEY)) || null;
  } catch {
    return null;
  }
}

export async function setTeaserVideoId(id: string | null): Promise<void> {
  await db.setSetting(TEASER_VIDEO_KEY, id ?? "");
}
