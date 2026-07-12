/**
 * Datenlayer-Umschalter:
 * - Supabase-Keys gesetzt  → Postgres (Produktion)
 * - sonst                  → data/store.json (Demo, zero-config)
 */
import { jsonDb } from "./jsondb";
import { supabaseDb } from "./supabasedb";

export const usingSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const db = usingSupabase ? supabaseDb : jsonDb;
