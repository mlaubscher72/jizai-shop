export type Size = "S" | "M" | "L" | "XL";

export const SIZES: Size[] = ["S", "M", "L", "XL"];

export interface ProductVariant {
  size: Size;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  kanji: string;
  accent: string;
  priceRappen: number;
  description: string;
  /** Erstes Bild = Hauptbild (Karten, Warenkorb); weitere = Galerie. */
  images: string[];
  active: boolean;
  /** false = "Bald verfügbar": sichtbar, aber nicht kaufbar (Benachrichtigen-CTA). */
  orderable: boolean;
  variants: ProductVariant[];
}

/* ---- Kategorien (Akte) — gespeichert im kanji-Feld ---- */
export type Act = "shu" | "ha" | "ri";

export const ACT_KANJI: Record<Act, string> = { shu: "守", ha: "破", ri: "離" };

export const ACT_LABEL: Record<Act, string> = {
  shu: "守 SHU",
  ha: "破 HA",
  ri: "離 RI",
};

export function actOf(product: Pick<Product, "kanji">): Act {
  if (product.kanji === "破") return "ha";
  if (product.kanji === "離") return "ri";
  return "shu";
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  kanji: string;
  image: string;
  size: Size;
  qty: number;
  priceRappen: number;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  size: Size;
  qty: number;
  priceRappen: number;
}

export interface Order {
  id: string;
  email: string;
  name: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  items: OrderItem[];
  totalRappen: number;
  status: OrderStatus;
  stripeSessionId?: string;
  createdAt: string;
}

export interface WaitlistEntry {
  email: string;
  createdAt: string;
}

export type AdminRole = "admin" | "manager" | "viewer";

export const ROLE_LABEL: Record<AdminRole, string> = {
  admin: "Admin",
  manager: "Manager",
  viewer: "Viewer",
};

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  /** Format: scrypt$<salt-hex>$<hash-hex> */
  passwordHash: string;
  /** Base32-Secret für 2FA. Leer/undefiniert = 2FA nicht aktiv. */
  totpSecret?: string;
  createdAt: string;
}

export function formatCHF(rappen: number): string {
  return `CHF ${(rappen / 100).toFixed(2).replace(/\.00$/, ".–")}`;
}
