import { actOf, Product } from "./types";

/* Preise zentral in CHF — hier ändern, gilt für Seed & schema.sql */
export const TEE_CORE = 79;
export const TEE_HERO = 89;
export const HOODIE = 139;

const chf = (francs: number) => francs * 100;

const STORAGE = "https://pkqnyeonuzittsqtworu.supabase.co/storage/v1/object/public/product-images";

/**
 * Akt-Logik: Das kanji-Feld trägt die Kategorie des Produkts.
 * 守 SHU → jetzt bestellbar · 破 HA → sichtbar, noch nicht bestellbar · 離 RI → Der Horizont
 */
export const SEED_PRODUCTS: Product[] = [
  /* ── Akt I · 守 SHU — jetzt bestellbar ─────────────────── */
  {
    id: "p_core_tee",
    slug: "core-tee",
    name: "JIZAI CORE TEE",
    subtitle: "Oversized Heavyweight Tee · 280 GSM",
    kanji: "守",
    orderable: true,
    accent: "#9A958B",
    priceRappen: chf(TEE_CORE),
    description: "Der gebrochene Ensō. Kleine Frontmarke, maximaler Negativraum. Das leiseste Stück der Serie.",
    images: ["/assets/tee-core.jpg", `${STORAGE}/core-enso-back.jpg`],
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
    orderable: true,
    accent: "#C8B79A",
    priceRappen: chf(TEE_HERO),
    description: "Die gehaltene Form: Meditation im gebrochenen Ensō, Tusche auf Soft Stone. Energie, enthalten — nicht entladen.",
    images: [`${STORAGE}/form-samurai.jpg`],
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
    orderable: true,
    accent: "#8C2F24",
    priceRappen: chf(HOODIE),
    description: "Schwerer Hoodie, gebrochener Ensō als Backprint. Ruhe, die man trägt.",
    images: ["/assets/hoodie-still.jpg"],
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
    orderable: false,
    accent: "#2E4E8F",
    priceRappen: chf(TEE_HERO),
    description: "Zwei Koi, ein Kreis aus Bewegung — vom JIZAI Cut präzise durchtrennt. Form wird gebrochen, nicht zerstört. Indigo auf Soft Stone.",
    images: [`${STORAGE}/break-koi.jpg`],
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
    orderable: false,
    accent: "#5E7285",
    priceRappen: chf(TEE_HERO),
    description: "Die Figur im Impuls: Tusche in Bewegung, der Strich als Kraft. Der Moment, in dem die Form aufbricht.",
    images: ["/assets/tee-motion.jpg"],
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
    orderable: false,
    accent: "#8C2F24",
    priceRappen: chf(HOODIE),
    description: "Der durchtrennte Kreis als Backprint auf schwerem Stoff. Präzision statt Lärm.",
    images: ["/assets/hoodie-break.jpg"],
    active: true,
    variants: [
      { size: "S", stock: 10 },
      { size: "M", stock: 15 },
      { size: "L", stock: 15 },
      { size: "XL", stock: 10 },
    ],
  },
];

/** Bestellbar-Flag pro Produkt — unabhängig von der Kategorie. */
export function isOrderable(product: Pick<Product, "orderable">): boolean {
  return product.orderable;
}
