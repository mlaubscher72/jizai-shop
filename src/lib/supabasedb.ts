/**
 * Produktions-Treiber: Supabase (Postgres).
 * Aktiv, sobald NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY gesetzt sind.
 * Schema: supabase/schema.sql
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { AdminUser, Order, Product, ProductVariant, WaitlistEntry } from "./types";

let client: SupabaseClient | null = null;

function sb(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return client;
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  kanji: string;
  accent: string;
  price_rappen: number;
  description: string;
  story: string;
  image: string;
  active: boolean;
  product_variants: { size: string; stock: number }[];
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle,
    kanji: row.kanji,
    accent: row.accent,
    priceRappen: row.price_rappen,
    description: row.description,
    story: row.story,
    image: row.image,
    active: row.active,
    variants: (row.product_variants ?? []).map((v) => ({
      size: v.size,
      stock: v.stock,
    })) as ProductVariant[],
  };
}

const PRODUCT_SELECT = "*, product_variants(size, stock)";

export const supabaseDb = {
  async getProducts(): Promise<Product[]> {
    const { data, error } = await sb().from("products").select(PRODUCT_SELECT).order("slug");
    if (error) throw error;
    return (data as ProductRow[]).map(rowToProduct);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await sb()
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToProduct(data as ProductRow) : null;
  },

  async updateProduct(id: string, patch: Partial<Product>): Promise<void> {
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.subtitle !== undefined) row.subtitle = patch.subtitle;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.story !== undefined) row.story = patch.story;
    if (patch.priceRappen !== undefined) row.price_rappen = patch.priceRappen;
    if (patch.active !== undefined) row.active = patch.active;
    if (Object.keys(row).length > 0) {
      const { error } = await sb().from("products").update(row).eq("id", id);
      if (error) throw error;
    }
    if (patch.variants) {
      for (const v of patch.variants) {
        const { error } = await sb()
          .from("product_variants")
          .update({ stock: v.stock })
          .eq("product_id", id)
          .eq("size", v.size);
        if (error) throw error;
      }
    }
  },

  async reserveStock(items: { productId: string; size: string; qty: number }[]): Promise<void> {
    // Atomar via Postgres-Funktion (siehe schema.sql)
    const { error } = await sb().rpc("reserve_stock", { items });
    if (error) throw new Error(error.message);
  },

  async restoreStock(items: { productId: string; size: string; qty: number }[]): Promise<void> {
    const { error } = await sb().rpc("restore_stock", { items });
    if (error) throw error;
  },

  async createOrder(order: Order): Promise<void> {
    const { error } = await sb().from("orders").insert({
      id: order.id,
      email: order.email,
      name: order.name,
      street: order.street,
      zip: order.zip,
      city: order.city,
      country: order.country,
      items: order.items,
      total_rappen: order.totalRappen,
      status: order.status,
      stripe_session_id: order.stripeSessionId ?? null,
      created_at: order.createdAt,
    });
    if (error) throw error;
  },

  async getOrders(): Promise<Order[]> {
    const { data, error } = await sb()
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      street: r.street,
      zip: r.zip,
      city: r.city,
      country: r.country,
      items: r.items,
      totalRappen: r.total_rappen,
      status: r.status,
      stripeSessionId: r.stripe_session_id ?? undefined,
      createdAt: r.created_at,
    }));
  },

  async getOrder(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.id === id) ?? null;
  },

  async updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
    const { error } = await sb().from("orders").update({ status }).eq("id", id);
    if (error) throw error;
  },

  async addToWaitlist(email: string): Promise<boolean> {
    const { error } = await sb().from("waitlist").insert({ email: email.toLowerCase() });
    if (error) {
      if (error.code === "23505") return false; // unique violation → schon eingetragen
      throw error;
    }
    return true;
  },

  async getWaitlist(): Promise<WaitlistEntry[]> {
    const { data, error } = await sb()
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({ email: r.email, createdAt: r.created_at }));
  },

  /* ---------- Admin-Benutzer ---------- */

  async getUsers(): Promise<AdminUser[]> {
    const { data, error } = await sb().from("admin_users").select("*").order("created_at");
    if (error) throw error;
    return (data ?? []).map(rowToUser);
  },

  async getUserByEmail(email: string): Promise<AdminUser | null> {
    const { data, error } = await sb()
      .from("admin_users")
      .select("*")
      .ilike("email", email)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToUser(data) : null;
  },

  async createUser(user: AdminUser): Promise<void> {
    const { error } = await sb().from("admin_users").insert({
      id: user.id,
      email: user.email.toLowerCase(),
      name: user.name,
      role: user.role,
      password_hash: user.passwordHash,
      created_at: user.createdAt,
    });
    if (error) {
      if (error.code === "23505") throw new Error("Diese E-Mail ist bereits vergeben");
      throw error;
    }
  },

  async updateUser(id: string, patch: Partial<AdminUser>): Promise<void> {
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.role !== undefined) row.role = patch.role;
    if (patch.passwordHash !== undefined) row.password_hash = patch.passwordHash;
    const { error } = await sb().from("admin_users").update(row).eq("id", id);
    if (error) throw error;
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await sb().from("admin_users").delete().eq("id", id);
    if (error) throw error;
  },
};

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: AdminUser["role"];
  password_hash: string;
  created_at: string;
}

function rowToUser(r: UserRow): AdminUser {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    passwordHash: r.password_hash,
    createdAt: r.created_at,
  };
}
