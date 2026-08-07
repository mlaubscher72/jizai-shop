#!/usr/bin/env node
/**
 * Erzeugt einen scrypt-Hash für ADMIN_PASSWORD_HASH.
 *
 *   node scripts/hash-password.mjs 'mein-langes-passwort'
 *
 * Den ausgegebenen Wert als ADMIN_PASSWORD_HASH setzen (Vercel + .env.local)
 * und ADMIN_PASSWORD entfernen. Damit liegt in der Umgebung kein direkt
 * verwendbares Passwort mehr — nur noch eine Prüfsumme.
 */
import { randomBytes, scryptSync } from "crypto";

const password = process.argv[2];

if (!password) {
  console.error("Aufruf: node scripts/hash-password.mjs 'passwort'");
  process.exit(1);
}
if (password.length < 12) {
  console.error(`Zu kurz (${password.length} Zeichen). Mindestens 12, besser 20+.`);
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 32).toString("hex");

console.log("\nADMIN_PASSWORD_HASH=" + `scrypt$${salt}$${hash}` + "\n");
console.log("→ In Vercel unter Settings → Environment Variables eintragen");
console.log("→ ADMIN_PASSWORD dort löschen");
