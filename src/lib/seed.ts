import { Product } from "./types";

/* Preise zentral in CHF — hier ändern, gilt für Seed & schema.sql */
export const TEE_CORE = 79;
export const TEE_HERO = 89;
export const HOODIE = 139;

const chf = (francs: number) => francs * 100;

/**
 * Akt-Logik: Das kanji-Feld trägt den Akt des Produkts.
 * 守 (SHU)  → jetzt bestellbar
 * 破 (HA)   → sichtbar, noch nicht bestellbar ("Benachrichtigen")
 */
export const SEED_PRODUCTS: Product[] = [
  /* ── Akt I · 守 SHU — jetzt bestellbar ─────────────────── */
  {
    id: "p_core_tee",
    slug: "core-tee",
    name: "JIZAI CORE TEE",
    subtitle: "Oversized Heavyweight Tee · 280 GSM",
    kanji: "守",
    accent: "#9A958B",
    priceRappen: chf(TEE_CORE),
    description: "Der gebrochene Ensō. Kleine Frontmarke, maximaler Negativraum. Das leiseste Stück der Serie.",
    story: "Der gebrochene Ensō. Kleine Frontmarke, maximaler Negativraum. Das leiseste Stück der Serie.",
    image: "/assets/tee-core.jpg",
    active: true,
    variants: [
      { size: "S", stock: 20 },
      { size: "M", stock: 30 },
      { size: "L", stock: 30 },
      { size: "XL", stock: 20 },
    ],
  },
  {
    id: "p_form_tee",
    slug: "form-tee",
    name: "JIZAI FORM TEE",
    subtitle: "Oversized Heavyweight Tee · 280 GSM",
    kanji: "守",
    accent: "#C8B79A",
    priceRappen: chf(TEE_HERO),
    description: "Die gehaltene Form: Meditation im gebrochenen Ensō, Tusche auf Soft Stone. Energie, enthalten — nicht entladen.",
    story: "Die gehaltene Form: Meditation im gebrochenen Ensō, Tusche auf Soft Stone. Energie, enthalten — nicht entladen.",
    image: "/assets/tee-form.jpg",
    active: true,
    variants: [
      { size: "S", stock: 20 },
      { size: "M", stock: 30 },
      { size: "L", stock: 30 },
      { size: "XL", stock: 20 },
    ],
  },
  {
    id: "p_still_hoodie",
    slug: "still-hoodie",
    name: "JIZAI STILL HOODIE",
    subtitle: "Heavyweight Hoodie · 450 GSM",
    kanji: "守",
    accent: "#8C2F24",
    priceRappen: chf(HOODIE),
    description: "Schwerer Hoodie, gebrochener Ensō als Backprint. Ruhe, die man trägt.",
    story: "Schwerer Hoodie, gebrochener Ensō als Backprint. Ruhe, die man trägt.",
    image: "/assets/hoodie-still.jpg",
    active: true,
    variants: [
      { size: "S", stock: 10 },
      { size: "M", stock: 15 },
      { size: "L", stock: 15 },
      { size: "XL", stock: 10 },
    ],
  },

  /* ── Akt II · 破 HA — sichtbar, noch nicht bestellbar ───── */
  {
    id: "p_break_tee",
    slug: "break-tee",
    name: "JIZAI BREAK TEE",
    subtitle: "Oversized Heavyweight Tee · 280 GSM",
    kanji: "破",
    accent: "#2E4E8F",
    priceRappen: chf(TEE_HERO),
    description: "Zwei Koi, ein Kreis aus Bewegung — vom JIZAI Cut präzise durchtrennt. Form wird gebrochen, nicht zerstört. Indigo auf Soft Stone.",
    story: "Zwei Koi, ein Kreis aus Bewegung — vom JIZAI Cut präzise durchtrennt. Form wird gebrochen, nicht zerstört. Indigo auf Soft Stone.",
    image: "/assets/tee-break.jpg",
    active: true,
    variants: [
      { size: "S", stock: 20 },
      { size: "M", stock: 30 },
      { size: "L", stock: 30 },
      { size: "XL", stock: 20 },
    ],
  },
  {
    id: "p_motion_tee",
    slug: "motion-tee",
    name: "JIZAI MOTION TEE",
    subtitle: "Oversized Heavyweight Tee · 280 GSM",
    kanji: "破",
    accent: "#5E7285",
    priceRappen: chf(TEE_HERO),
    description: "Die Figur im Impuls: Tusche in Bewegung, der Strich als Kraft. Der Moment, in dem die Form aufbricht.",
    story: "Die Figur im Impuls: Tusche in Bewegung, der Strich als Kraft. Der Moment, in dem die Form aufbricht.",
    image: "/assets/tee-motion.jpg",
    active: true,
    variants: [
      { size: "S", stock: 20 },
      { size: "M", stock: 30 },
      { size: "L", stock: 30 },
      { size: "XL", stock: 20 },
    ],
  },
  {
    id: "p_break_hoodie",
    slug: "break-hoodie",
    name: "JIZAI BREAK HOODIE",
    subtitle: "Heavyweight Hoodie · 450 GSM",
    kanji: "破",
    accent: "#8C2F24",
    priceRappen: chf(HOODIE),
    description: "Der durchtrennte Kreis als Backprint auf schwerem Stoff. Präzision statt Lärm.",
    story: "Der durchtrennte Kreis als Backprint auf schwerem Stoff. Präzision statt Lärm.",
    image: "/assets/hoodie-break.jpg",
    active: true,
    variants: [
      { size: "S", stock: 10 },
      { size: "M", stock: 15 },
      { size: "L", stock: 15 },
      { size: "XL", stock: 10 },
    ],
  },
];

/** 破-Produkte sind sichtbar, aber noch nicht bestellbar. */
export function isOrderable(product: Pick<Product, "kanji">): boolean {
  return product.kanji !== "破";
}
