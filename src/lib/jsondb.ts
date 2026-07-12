/**
 * Demo-Treiber: persistiert alles in data/store.json.
 * Läuft ohne jede Konfiguration — für lokale Entwicklung & Demo.
 * Produktion: Supabase-Treiber (siehe supabasedb.ts), aktiviert via env.
 */
import { promises as fs } from "fs";
import path from "path";
import { AdminUser, Order, Product, WaitlistEntry } from "./types";
import { SEED_PRODUCTS } from "./seed";

interface Store {
  products: Product[];
  orders: Order[];
  waitlist: WaitlistEntry[];
  users?: AdminUser[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

let writeQueue: Promise<unknown> = Promise.resolve();

// In-Memory-Fallback: Auf Plattformen mit read-only Dateisystem (z. B. Vercel)
// lebt der Demo-Store nur im Speicher der Lambda-Instanz. Für echte
// Persistenz in Produktion Supabase konfigurieren (siehe README).
let memStore: Store | null = null;

async function load(): Promise<Store> {
  if (memStore) return memStore;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    memStore = JSON.parse(raw) as Store;
  } catch {
    memStore = { products: structuredClone(SEED_PRODUCTS), orders: [], waitlist: [] };
    await save(memStore);
  }
  return memStore;
}

async function save(store: Store): Promise<void> {
  memStore = store;
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
    } catch {
      // Read-only-Dateisystem — Daten bleiben im Speicher (Demo-Modus)
    }
  });
  await writeQueue;
}

export const jsonDb = {
  async getProducts(): Promise<Product[]> {
    return (await load()).products;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const store = await load();
    return store.products.find((p) => p.slug === slug) ?? null;
  },

  async updateProduct(id: string, patch: Partial<Product>): Promise<void> {
    const store = await load();
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Produkt ${id} nicht gefunden`);
    store.products[idx] = { ...store.products[idx], ...patch, id };
    await save(store);
  },

  /** Atomar Bestand prüfen & abbuchen. Wirft bei zu wenig Bestand. */
  async reserveStock(items: { productId: string; size: string; qty: number }[]): Promise<void> {
    const store = await load();
    for (const item of items) {
      const product = store.products.find((p) => p.id === item.productId);
      const variant = product?.variants.find((v) => v.size === item.size);
      if (!product || !variant) throw new Error(`Variante ${item.productId}/${item.size} nicht gefunden`);
      if (variant.stock < item.qty) {
        throw new Error(`${product.name} (${item.size}) ist nicht mehr in dieser Menge verfügbar`);
      }
    }
    for (const item of items) {
      const product = store.products.find((p) => p.id === item.productId)!;
      const variant = product.variants.find((v) => v.size === item.size)!;
      variant.stock -= item.qty;
    }
    await save(store);
  },

  async restoreStock(items: { productId: string; size: string; qty: number }[]): Promise<void> {
    const store = await load();
    for (const item of items) {
      const variant = store.products
        .find((p) => p.id === item.productId)
        ?.variants.find((v) => v.size === item.size);
      if (variant) variant.stock += item.qty;
    }
    await save(store);
  },

  async createOrder(order: Order): Promise<void> {
    const store = await load();
    store.orders.unshift(order);
    await save(store);
  },

  async getOrders(): Promise<Order[]> {
    return (await load()).orders;
  },

  async getOrder(id: string): Promise<Order | null> {
    const store = await load();
    return store.orders.find((o) => o.id === id) ?? null;
  },

  async updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
    const store = await load();
    const order = store.orders.find((o) => o.id === id);
    if (!order) throw new Error(`Bestellung ${id} nicht gefunden`);
    order.status = status;
    await save(store);
  },

  async addToWaitlist(email: string): Promise<boolean> {
    const store = await load();
    if (store.waitlist.some((w) => w.email.toLowerCase() === email.toLowerCase())) return false;
    store.waitlist.unshift({ email, createdAt: new Date().toISOString() });
    await save(store);
    return true;
  },

  async getWaitlist(): Promise<WaitlistEntry[]> {
    return (await load()).waitlist;
  },

  /* ---------- Admin-Benutzer ---------- */

  async getUsers(): Promise<AdminUser[]> {
    return (await load()).users ?? [];
  },

  async getUserByEmail(email: string): Promise<AdminUser | null> {
    const users = (await load()).users ?? [];
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  },

  async createUser(user: AdminUser): Promise<void> {
    const store = await load();
    store.users = store.users ?? [];
    if (store.users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
      throw new Error("Diese E-Mail ist bereits vergeben");
    }
    store.users.push(user);
    await save(store);
  },

  async updateUser(id: string, patch: Partial<AdminUser>): Promise<void> {
    const store = await load();
    const user = (store.users ?? []).find((u) => u.id === id);
    if (!user) throw new Error("Benutzer nicht gefunden");
    Object.assign(user, patch, { id });
    await save(store);
  },

  async deleteUser(id: string): Promise<void> {
    const store = await load();
    store.users = (store.users ?? []).filter((u) => u.id !== id);
    await save(store);
  },
};
