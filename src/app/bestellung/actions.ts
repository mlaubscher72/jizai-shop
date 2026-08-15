"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { grantOrderAccess, revokeOrderAccess } from "@/lib/order-access";
import { checkLocked, loginDelay, recordFailure, recordSuccess } from "@/lib/rate-limit";
import { Lang, localePath } from "@/lib/i18n";

/** Sprache kommt als verstecktes Feld aus dem Formular — der Redirect muss sie behalten. */
function orderPath(formData: FormData): string {
  const lang: Lang = formData.get("lang") === "en" ? "en" : "de";
  return localePath(lang, "/bestellung");
}

/**
 * Bestellung nachschlagen: E-Mail UND Bestellnummer müssen zusammenpassen.
 * Die Fehlermeldung ist bewusst identisch für "Nummer falsch" und
 * "E-Mail passt nicht" — sonst liesse sich prüfen, welche Nummern existieren.
 */
export async function lookupOrderAction(formData: FormData) {
  const base = orderPath(formData);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const orderId = String(formData.get("orderId") || "").trim().toLowerCase();

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0].trim() || hdrs.get("x-real-ip") || "unknown";
  const key = `${ip}|order-lookup`;

  const lockedFor = checkLocked(key);
  if (lockedFor > 0) redirect(`${base}?locked=${lockedFor}`);

  await loginDelay();

  if (!email || !orderId) redirect(`${base}?error=1`);

  const order = await db.getOrder(orderId);
  if (!order || order.email.trim().toLowerCase() !== email) {
    recordFailure(key);
    redirect(`${base}?error=1`);
  }

  recordSuccess(key);
  await grantOrderAccess(order.id);
  redirect(base);
}

export async function closeOrderAction(formData: FormData) {
  const base = orderPath(formData);
  await revokeOrderAccess();
  redirect(base);
}
