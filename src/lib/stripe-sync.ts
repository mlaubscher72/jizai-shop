import Stripe from "stripe";
import { db } from "./db";
import { sendOrderConfirmation } from "./mail";
import { Order } from "./types";
import type { Lang } from "./i18n";

/**
 * Markiert eine Bestellung als bezahlt — genau einmal.
 * Wird sowohl vom Webhook als auch von der Success-Seite aufgerufen;
 * die Statusprüfung verhindert doppelte Bestätigungsmails.
 */
export async function markOrderPaid(order: Order, lang: Lang = "de"): Promise<boolean> {
  if (order.status !== "pending") return false;
  await db.updateOrderStatus(order.id, "paid");
  await sendOrderConfirmation({ ...order, status: "paid" }, lang);
  return true;
}

/**
 * Fallback für die Success-Seite: fragt Stripe direkt, ob bezahlt wurde.
 * So ist die Bestellung auch dann korrekt, wenn der Webhook noch nicht
 * eingerichtet ist oder verzögert eintrifft.
 */
export async function reconcileOrderWithStripe(order: Order): Promise<Order> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || order.status !== "pending" || !order.stripeSessionId) return order;
  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    if (session.payment_status === "paid") {
      // Die Sprache der Bestellung reist in den Stripe-Metadaten mit
      await markOrderPaid(order, session.metadata?.lang === "en" ? "en" : "de");
      return { ...order, status: "paid" };
    }
  } catch (e) {
    console.error("[stripe] Abgleich fehlgeschlagen:", e);
  }
  return order;
}
