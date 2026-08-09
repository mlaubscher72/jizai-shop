"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import {
  verifyRootPassword,
  clearAdminCookie,
  clearPendingTotp,
  getPendingTotp,
  setPendingTotp,
  getSession,
  hashPassword,
  roleAtLeast,
  setAdminCookie,
  verifyPassword,
} from "@/lib/auth";
import { Act, ACT_KANJI, AdminRole, OrderStatus, Product, Size, SIZES } from "@/lib/types";
import { checkLocked, loginDelay, recordFailure, recordSuccess } from "@/lib/rate-limit";
import { generateSecret, verifyTotp } from "@/lib/totp";

/* ---------- Login / Logout ---------- */

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  // Sperre pro IP + Kennung: bremst automatisiertes Durchprobieren aus
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0].trim() || hdrs.get("x-real-ip") || "unknown";
  const key = `${ip}|${email.toLowerCase() || "root"}`;

  const lockedFor = checkLocked(key);
  if (lockedFor > 0) {
    redirect(`/admin/login?locked=${lockedFor}`);
  }

  await loginDelay();

  // 1) Benutzer aus der Datenbank
  if (email) {
    const user = await db.getUserByEmail(email);
    if (user && verifyPassword(password, user.passwordHash)) {
      recordSuccess(key);
      // 2FA aktiv? Dann erst der zweite Schritt — Passwort allein reicht nicht.
      if (user.totpSecret) {
        await setPendingTotp(user.email);
        redirect("/admin/login?step=2");
      }
      await setAdminCookie({ email: user.email, name: user.name, role: user.role });
      redirect("/admin");
    }
  }

  // 2) Root-Login (E-Mail-Feld leer) — abschaltbar via ADMIN_ROOT_LOGIN=off
  if (!email && verifyRootPassword(password)) {
    recordSuccess(key);
    await setAdminCookie({ email: "root", name: "Root", role: "admin" });
    redirect("/admin");
  }

  recordFailure(key);
  redirect("/admin/login?error=1");
}

/** Zweiter Login-Schritt: 6-stelliger Code aus der Authenticator-App. */
export async function verifyTotpAction(formData: FormData) {
  const code = String(formData.get("code") || "");
  const email = await getPendingTotp();
  if (!email) redirect("/admin/login?error=1");

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0].trim() || hdrs.get("x-real-ip") || "unknown";
  const key = `${ip}|2fa|${email.toLowerCase()}`;

  const lockedFor = checkLocked(key);
  if (lockedFor > 0) redirect(`/admin/login?step=2&locked=${lockedFor}`);

  await loginDelay();

  const user = await db.getUserByEmail(email);
  if (user?.totpSecret && verifyTotp(user.totpSecret, code)) {
    recordSuccess(key);
    await clearPendingTotp();
    await setAdminCookie({ email: user.email, name: user.name, role: user.role });
    redirect("/admin");
  }

  recordFailure(key);
  redirect("/admin/login?step=2&error=1");
}

export async function logoutAction() {
  await clearAdminCookie();
  redirect("/admin/login");
}

/* ---------- 2FA verwalten (eigener Account) ---------- */

/** Erzeugt ein neues Secret und legt es in den Zwischenschritt-Cookie, bis es bestätigt ist. */
export async function startTotpSetupAction() {
  const session = await getSession();
  if (!session || session.email === "root") redirect("/admin/security");
  const secret = generateSecret();
  const store = await cookies();
  store.set("jizai_totp_setup", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
  redirect("/admin/security");
}

export async function confirmTotpAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.email === "root") redirect("/admin/security");
  const code = String(formData.get("code") || "");
  const store = await cookies();
  const secret = store.get("jizai_totp_setup")?.value;
  if (!secret) redirect("/admin/security?error=nosetup");

  if (!verifyTotp(secret, code)) redirect("/admin/security?error=code");

  const user = await db.getUserByEmail(session.email);
  if (!user) redirect("/admin/security?error=nouser");
  try {
    await db.updateUser(user.id, { totpSecret: secret });
  } catch (e) {
    // Häufigster Fall: die Spalte totp_secret fehlt noch (Migration nicht gelaufen)
    console.error("[2fa] Speichern fehlgeschlagen:", e);
    redirect("/admin/security?error=migration");
  }
  store.delete("jizai_totp_setup");
  revalidatePath("/admin/security");
  redirect("/admin/security?ok=1");
}

export async function disableTotpAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.email === "root") redirect("/admin/security");
  // Zum Abschalten wird ein gültiger Code verlangt — sonst genügt ein
  // übernommenes Cookie, um den Schutz wieder zu entfernen.
  const code = String(formData.get("code") || "");
  const user = await db.getUserByEmail(session.email);
  if (!user?.totpSecret) redirect("/admin/security");
  if (!verifyTotp(user.totpSecret, code)) redirect("/admin/security?error=code");
  await db.updateUser(user.id, { totpSecret: "" });
  revalidatePath("/admin/security");
  redirect("/admin/security?off=1");
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

function parseAct(value: unknown): Act {
  return value === "ha" || value === "ri" ? value : "shu";
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/jizai/g, "")
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] as string))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `produkt-${randomBytes(2).toString("hex")}`;
}

function revalidateShop() {
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProductAction(formData: FormData) {
  await requireRole("manager");
  const id = String(formData.get("id"));
  const priceFrancs = parseFloat(String(formData.get("price")).replace(",", "."));
  const active = formData.get("active") === "on";
  const act = parseAct(formData.get("act"));
  const description = String(formData.get("description") || "").trim();

  const variants = SIZES.map((size) => ({
    size: size as Size,
    stock: Math.max(0, Math.floor(Number(formData.get(`stock_${size}`)) || 0)),
  }));

  await db.updateProduct(id, {
    priceRappen: Number.isFinite(priceFrancs) ? Math.round(priceFrancs * 100) : undefined,
    active,
    orderable: formData.get("orderable") === "1",
    kanji: ACT_KANJI[act],
    description: description || undefined,
    variants,
  });
  revalidateShop();
}

export async function createProductAction(formData: FormData) {
  await requireRole("manager");
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Name fehlt");
  const act = parseAct(formData.get("act"));
  const priceFrancs = parseFloat(String(formData.get("price") || "89").replace(",", "."));
  const subtitle = String(formData.get("subtitle") || "").trim() || "Oversized Heavyweight Tee · 280 GSM";
  const description = String(formData.get("description") || "").trim();
  const active = formData.get("active") === "on";
  const stock = Math.max(0, Math.floor(Number(formData.get("stock")) || 0));
  const images = formData
    .getAll("images")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const product: Product = {
    id: `p_${randomBytes(4).toString("hex")}`,
    slug: slugify(name),
    name,
    subtitle,
    kanji: ACT_KANJI[act],
    accent: act === "shu" ? "#9A958B" : act === "ha" ? "#8C2F24" : "#C8B79A",
    priceRappen: Number.isFinite(priceFrancs) ? Math.round(priceFrancs * 100) : 8900,
    description,
    images,
    active,
    orderable: formData.get("orderable") === "1",
    variants: SIZES.map((size) => ({ size, stock })),
  };
  await db.createProduct(product);
  revalidateShop();
}

export async function deleteProductAction(formData: FormData) {
  await requireRole("manager");
  const id = String(formData.get("id"));
  await db.deleteProduct(id);
  revalidateShop();
}

export async function addProductImageAction(formData: FormData) {
  await requireRole("manager");
  const id = String(formData.get("id"));
  const url = String(formData.get("url") || "").trim();
  if (!url) return;
  const product = (await db.getProducts()).find((p) => p.id === id);
  if (!product) throw new Error("Produkt nicht gefunden");
  await db.updateProduct(id, { images: [...product.images, url] });
  revalidateShop();
}

export async function removeProductImageAction(formData: FormData) {
  await requireRole("manager");
  const id = String(formData.get("id"));
  const url = String(formData.get("url"));
  const product = (await db.getProducts()).find((p) => p.id === id);
  if (!product) return;
  await db.updateProduct(id, { images: product.images.filter((i) => i !== url) });
  revalidateShop();
}

export async function makePrimaryImageAction(formData: FormData) {
  await requireRole("manager");
  const id = String(formData.get("id"));
  const url = String(formData.get("url"));
  const product = (await db.getProducts()).find((p) => p.id === id);
  if (!product || !product.images.includes(url)) return;
  await db.updateProduct(id, { images: [url, ...product.images.filter((i) => i !== url)] });
  revalidateShop();
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
