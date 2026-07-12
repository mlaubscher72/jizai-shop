"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import {
  adminPassword,
  clearAdminCookie,
  getSession,
  hashPassword,
  roleAtLeast,
  setAdminCookie,
  verifyPassword,
} from "@/lib/auth";
import { AdminRole, OrderStatus, Size, SIZES } from "@/lib/types";

/* ---------- Login / Logout ---------- */

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  // 1) Benutzer aus der Datenbank
  if (email) {
    const user = await db.getUserByEmail(email);
    if (user && verifyPassword(password, user.passwordHash)) {
      await setAdminCookie({ email: user.email, name: user.name, role: user.role });
      redirect("/admin");
    }
  }

  // 2) Root-Fallback: ADMIN_PASSWORD aus der Umgebung (E-Mail-Feld darf leer sein)
  if (!email && password === adminPassword()) {
    await setAdminCookie({ email: "root", name: "Root", role: "admin" });
    redirect("/admin");
  }

  redirect("/admin/login?error=1");
}

export async function logoutAction() {
  await clearAdminCookie();
  redirect("/admin/login");
}

/* ---------- Berechtigungen ---------- */

async function requireRole(min: AdminRole) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!roleAtLeast(session.role, min)) {
    throw new Error("Keine Berechtigung für diese Aktion");
  }
  return session;
}

/* ---------- Produkte (ab Manager) ---------- */

export async function updateProductAction(formData: FormData) {
  await requireRole("manager");
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

/* ---------- Bestellungen (ab Manager) ---------- */

export async function setOrderStatusAction(formData: FormData) {
  await requireRole("manager");
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  if (!["pending", "paid", "shipped", "cancelled"].includes(status)) return;

  const order = await db.getOrder(id);
  if (!order) return;

  if (status === "cancelled" && order.status !== "cancelled") {
    await db.restoreStock(order.items);
  }
  if (order.status === "cancelled" && status !== "cancelled") {
    await db.reserveStock(order.items);
  }

  await db.updateOrderStatus(id, status);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

/* ---------- Benutzerverwaltung (nur Admin) ---------- */

export async function createUserAction(formData: FormData) {
  await requireRole("admin");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role")) as AdminRole;
  const password = String(formData.get("password") || "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Ungültige E-Mail");
  if (!name) throw new Error("Name fehlt");
  if (!["admin", "manager", "viewer"].includes(role)) throw new Error("Ungültige Rolle");
  if (password.length < 8) throw new Error("Passwort braucht mindestens 8 Zeichen");

  await db.createUser({
    id: `u_${randomBytes(5).toString("hex")}`,
    email,
    name,
    role,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  });
  revalidatePath("/admin/users");
}

export async function updateUserAction(formData: FormData) {
  const session = await requireRole("admin");
  const id = String(formData.get("id"));
  const role = String(formData.get("role")) as AdminRole;
  const password = String(formData.get("password") || "");

  const users = await db.getUsers();
  const target = users.find((u) => u.id === id);
  if (!target) throw new Error("Benutzer nicht gefunden");

  // Letzten Admin nicht degradieren (Root-Login bleibt als Rettungsanker)
  if (target.role === "admin" && role !== "admin" && session.email !== "root") {
    const adminCount = users.filter((u) => u.role === "admin").length;
    if (adminCount <= 1 && target.email === session.email) {
      throw new Error("Du kannst dir nicht selbst die Admin-Rolle entziehen");
    }
  }

  const patch: { role?: AdminRole; passwordHash?: string } = {};
  if (["admin", "manager", "viewer"].includes(role)) patch.role = role;
  if (password) {
    if (password.length < 8) throw new Error("Passwort braucht mindestens 8 Zeichen");
    patch.passwordHash = hashPassword(password);
  }
  await db.updateUser(id, patch);
  revalidatePath("/admin/users");
}

export async function deleteUserAction(formData: FormData) {
  const session = await requireRole("admin");
  const id = String(formData.get("id"));
  const users = await db.getUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return;
  if (target.email === session.email) {
    throw new Error("Du kannst dich nicht selbst löschen");
  }
  await db.deleteUser(id);
  revalidatePath("/admin/users");
}
