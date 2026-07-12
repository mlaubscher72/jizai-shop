import { Product } from "./types";

export const SEED_PRODUCTS: Product[] = [
  {
    id: "p_koi",
    slug: "koi",
    name: "KOI",
    subtitle: "Circling",
    kanji: "鯉",
    accent: "#8C2F24",
    priceRappen: 7500,
    description: "Zwei Koi, eine Bewegung. Rote Tusche auf Soft Stone.",
    story:
      "Zwei Koi umkreisen einander in einer einzigen Geste — gezogen wie ein Atemzug, nie geschlossen. Der Kreis bleibt offen: die Praxis geht weiter. Rote Sumi-e-Tusche auf warmem Soft Stone, das kleine 自在-Seal als Signatur.",
    image: "/assets/tee-koi.jpg",
    active: true,
    variants: [
      { size: "S", stock: 20 },
      { size: "M", stock: 30 },
      { size: "L", stock: 30 },
      { size: "XL", stock: 20 },
    ],
  },
  {
    id: "p_tsuru",
    slug: "tsuru",
    name: "TSURU",
    subtitle: "Rising",
    kanji: "鶴",
    accent: "#2E4E8F",
    priceRappen: 7500,
    description: "Der Kranich im Aufstieg. Indigo auf Charcoal Ink.",
    story:
      "Der Kranich steigt — ohne Eile, ohne Lärm. Indigoblaue Federzeichnung auf Charcoal Black, inspiriert von Aizome-Färbung und alten Gi. Für den Moment, in dem Form zu Freiheit wird.",
    image: "/assets/tee-crane.jpg",
    active: true,
    variants: [
      { size: "S", stock: 20 },
      { size: "M", stock: 30 },
      { size: "L", stock: 30 },
      { size: "XL", stock: 20 },
    ],
  },
  {
    id: "p_furin",
    slug: "furin",
    name: "FŪRIN",
    subtitle: "Listening",
    kanji: "鈴",
    accent: "#4E6B3A",
    priceRappen: 7500,
    description: "Die Windglocke. Klang, bevor der Lärm beginnt.",
    story:
      "Die Fūrin-Windglocke hängt still, bis der Wind sie findet. Grüne Aquarell-Tusche mit Ahornblättern auf Soft Stone — das leiseste Stück des Drops, und vielleicht das stärkste.",
    image: "/assets/tee-bell.jpg",
    active: true,
    variants: [
      { size: "S", stock: 20 },
      { size: "M", stock: 30 },
      { size: "L", stock: 30 },
      { size: "XL", stock: 20 },
    ],
  },
  {
    id: "p_take",
    slug: "take",
    name: "TAKE",
    subtitle: "Bending",
    kanji: "竹",
    accent: "#5E7285",
    priceRappen: 7500,
    description: "Bambus: biegsam, nie gebrochen. Stille Stärke.",
    story:
      "Bambus biegt sich im Sturm und bricht nicht — die älteste Lektion des Budo. Blaugraue Tusche mit Blüten auf Charcoal Black. Erst die Form, dann die Freiheit.",
    image: "/assets/tee-bamboo.jpg",
    active: true,
    variants: [
      { size: "S", stock: 20 },
      { size: "M", stock: 30 },
      { size: "L", stock: 30 },
      { size: "XL", stock: 20 },
    ],
  },
];
