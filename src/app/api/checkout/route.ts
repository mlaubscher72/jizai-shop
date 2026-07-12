import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/mail";
import { Order, OrderItem } from "@/lib/types";

const SHIPPING_RAPPEN = 900;

function orderId(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let id = "";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return `jz_${id}`;
}

interface CheckoutBody {
  items: { productId: string; size: string; qty: number }[];
  customer: { email: string; name: string; street: string; zip: string; city: string };
}

export async function POST(req: Request) {
  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  const { items, customer } = body;
  if (!items?.length) return NextResponse.json({ error: "Warenkorb ist leer" }, { status: 400 });
  if (!customer?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    return NextResponse.json({ error: "Bitte gültige E-Mail angeben" }, { status: 400 });
  }
  if (!customer.name || !customer.street || !customer.zip || !customer.city) {
    return NextResponse.json({ error: "Bitte Lieferadresse vollständig ausfüllen" }, { status: 400 });
  }

  // Preise & Produkte IMMER serverseitig auflösen — Client-Preise sind nicht vertrauenswürdig
  const products = await db.getProducts();
  const orderItems: OrderItem[] = [];
  for (const item of items) {
    const qty = Math.floor(Number(item.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > 10) {
      return NextResponse.json({ error: "Ungültige Menge" }, { status: 400 });
    }
    const product = products.find((p) => p.id === item.productId && p.active);
    const variant = product?.variants.find((v) => v.size === item.size);
    if (!product || !variant) {
      return NextResponse.json({ error: "Produkt nicht gefunden" }, { status: 400 });
    }
    orderItems.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: variant.size,
      qty,
      priceRappen: product.priceRappen,
    });
  }

  const totalRappen =
    orderItems.reduce((s, i) => s + i.qty * i.priceRappen, 0) + SHIPPING_RAPPEN;

  // Bestand atomar reservieren
  try {
    await db.reserveStock(orderItems);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Bestand nicht verfügbar" },
      { status: 409 }
    );
  }

  const order: Order = {
    id: orderId(),
    email: customer.email.trim(),
    name: customer.name.trim(),
    street: customer.street.trim(),
    zip: customer.zip.trim(),
    city: customer.city.trim(),
    country: "CH",
    items: orderItems,
    totalRappen,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (stripeKey) {
    // Stripe Checkout (Test- oder Live-Modus je nach Key)
    try {
      const stripe = new Stripe(stripeKey);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: order.email,
        line_items: [
          ...orderItems.map((i) => ({
            price_data: {
              currency: "chf",
              unit_amount: i.priceRappen,
              product_data: { name: `JIZAI ${i.name} — Grösse ${i.size}` },
            },
            quantity: i.qty,
          })),
          {
            price_data: {
              currency: "chf",
              unit_amount: SHIPPING_RAPPEN,
              product_data: { name: "Versand (CH)" },
            },
            quantity: 1,
          },
        ],
        metadata: { orderId: order.id },
        success_url: `${baseUrl}/checkout/success?order=${order.id}`,
        cancel_url: `${baseUrl}/checkout?cancelled=1`,
      });
      order.stripeSessionId = session.id;
      await db.createOrder(order);
      return NextResponse.json({ mode: "stripe", url: session.url });
    } catch (e) {
      await db.restoreStock(orderItems);
      console.error("Stripe-Fehler:", e);
      return NextResponse.json({ error: "Zahlung konnte nicht gestartet werden" }, { status: 502 });
    }
  }

  // Demo-Modus: Bestellung direkt als bezahlt markieren
  order.status = "paid";
  await db.createOrder(order);
  await sendOrderConfirmation(order); // blockiert nie — Fehler werden nur geloggt
  return NextResponse.json({ mode: "demo", orderId: order.id });
}
