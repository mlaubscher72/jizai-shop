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
  story: string;
  image: string;
  active: boolean;
  variants: ProductVariant[];
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

export function formatCHF(rappen: number): string {
  return `CHF ${(rappen / 100).toFixed(2).replace(/\.00$/, ".–")}`;
}
