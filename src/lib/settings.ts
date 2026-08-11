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
