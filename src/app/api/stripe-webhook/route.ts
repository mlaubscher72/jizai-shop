import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/mail";

/**
 * Stripe-Webhook: markiert Bestellungen nach erfolgreicher Zahlung als "paid".
 * In Stripe konfigurieren: Endpoint <BASE_URL>/api/stripe-webhook,
 * Event: checkout.session.completed — Secret in STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe nicht konfiguriert" }, { status: 501 });
  }

  const stripe = new Stripe(stripeKey);
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Signatur fehlt" }, { status: 400 });

  let event: Stripe.Event;
  try {
    const payload = await req.text();
    event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Ungültige Signatur" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await db.updateOrderStatus(orderId, "paid");
      const order = await db.getOrder(orderId);
      if (order) await sendOrderConfirmation({ ...order, status: "paid" });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const order = await db.getOrder(orderId);
      if (order && order.status === "pending") {
        await db.updateOrderStatus(orderId, "cancelled");
        await db.restoreStock(order.items);
      }
    }
  }

  return NextResponse.json({ received: true });
}
