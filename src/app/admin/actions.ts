"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { adminPassword, clearAdminCookie, isAdmin, setAdminCookie } from "@/lib/auth";
import { OrderStatus, Size, SIZES } from "@/lib/types";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (password === adminPassword()) {
    await setAdminCookie();
    redirect("/admin");
  }
  redirect("/admin/login?error=1");
}

export async function logoutAction() {
  await clearAdminCookie();
  redirect("/admin/login");
}

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const priceFrancs = parseFloat(String(formData.get("price")).replace(",", "."));
  const active = formData.get("active") === "on";

  const variants = SIZES.map((size) => ({
    size: size as Size,
    stock: Math.max(0, Math.floor(Number(formData.get(`stock_${size}`)) || 0)),
  }));

  await db.updateProduct(id, {
    priceRappen: Number.isFinite(priceFrancs) ? Math.round(priceFrancs * 100) : undefined,
    active,
    variants,
  });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function setOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  if (!["pending", "paid", "shipped", "cancelled"].includes(status)) return;

  const order = await db.getOrder(id);
  if (!order) return;

  // Bestand zurückbuchen, wenn eine aktive Bestellung storniert wird
  if (status === "cancelled" && order.status !== "cancelled") {
    await db.restoreStock(order.items);
  }
  // Bestand erneut abbuchen, wenn eine stornierte Bestellung reaktiviert wird
  if (order.status === "cancelled" && status !== "cancelled") {
    await db.reserveStock(order.items);
  }

  await db.updateOrderStatus(id, status);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
