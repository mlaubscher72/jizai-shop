/**
 * Zweisprachigkeit: Deutsch unter `/`, Englisch unter `/en`.
 *
 * Markensprache bleibt in beiden Fassungen Englisch ("Begin before the noise.",
 * "First the form. Then the freedom.", "JIZAI CORE TEE") — das sind Namen und
 * Claims, keine übersetzbaren Texte.
 *
 * Japanische Zeichen tragen in beiden Sprachen ihre Bedeutung mit sich
 * (Projektregel: nichts steht unerklärt da).
 */

import type { ReactNode } from "react";
import type { Product } from "./types";

export type Lang = "de" | "en";

export const LANGS: Lang[] = ["de", "en"];

/** Die Bestellverfolgung heisst auf Deutsch /bestellung, auf Englisch /en/order. */
const ORDER_DE = "/bestellung";
const ORDER_EN = "/en/order";

/** Pfad in der jeweiligen Sprache. Deutsch bleibt ohne Präfix. */
export function localePath(lang: Lang, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === "de") return clean;
  if (clean === ORDER_DE) return ORDER_EN;
  return clean === "/" ? "/en" : `/en${clean}`;
}

/** Sprache aus dem Pfad ableiten — für Client-Komponenten ohne Server-Props. */
export function langFromPath(pathname: string): Lang {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "de";
}

/** Gegenstück des aktuellen Pfads in der anderen Sprache — für den Umschalter. */
export function switchPath(pathname: string): string {
  if (langFromPath(pathname) === "de") {
    if (pathname === ORDER_DE) return ORDER_EN;
    return pathname === "/" ? "/en" : `/en${pathname}`;
  }
  if (pathname === ORDER_EN) return ORDER_DE;
  const stripped = pathname.replace(/^\/en/, "");
  return stripped === "" ? "/" : stripped;
}

/**
 * hreflang-Auszeichnung für Google: beide Fassungen verweisen aufeinander,
 * x-default zeigt auf die deutsche. `path` ist immer der deutsche Pfad.
 */
export function langAlternates(lang: Lang, path: string) {
  return {
    canonical: localePath(lang, path),
    languages: {
      de: localePath("de", path),
      en: localePath("en", path),
      "x-default": localePath("de", path),
    },
  };
}

/** Produktbeschreibung in der Sprache — leeres englisches Feld fällt auf Deutsch zurück. */
export function productDescription(
  product: Pick<Product, "description" | "descriptionEn">,
  lang: Lang
): string {
  if (lang === "en") return product.descriptionEn?.trim() || product.description;
  return product.description;
}

interface Dict {
  htmlLang: string;
  locale: string;
  metaTitle: string;
  metaDescription: string;
  orderMetaTitle: string;
  orderMetaDescription: string;

  /* Navigation */
  navPhilosophy: string;
  navDrop: string;
  navAbout: string;
  navCart: string;
  navCartOpen: string;
  navShuhariSub: string;
  langSwitchLabel: string;

  /* Hero */
  heroEyebrow: string;
  heroImgAlt: string;
  heroCaption: string;
  heroScroll: string;
  heroDropTag: string;

  /* Manifest */
  manifestoLabel: string;
  manifestoTitle: string;
  manifestoNote: ReactNode;

  /* Pillars */
  pillarsLabel: string;
  pillars: { k: string; t: string; d: string }[];

  /* Drop */
  dropLabel: string;
  dropTitleA: string;
  dropTitleB: string;
  dropIntro: string;
  acts: { kanji: string; title: string; sub: string; state: string }[];
  kanjiMeaning: Record<string, string>;
  badgeSoon: string;
  badgeSoldOut: string;
  badgeLeft: (n: number) => string;

  /* Shu-Ha-Ri */
  shuhariLabel: string;
  shuhari: { k: string; n: string; s: string; d: string; drop: string }[];

  /* Lookbook */
  lookbookAlts: [string, string, string];
  lookbookQuote: string;

  /* About */
  aboutLeadA: string;
  aboutLeadB: string;
  aboutText1: string;
  aboutKanji: string;
  aboutText2: string;
  aboutText3: string;
  aboutClose: string;

  /* Waitlist */
  waitlistLabel: string;
  waitlistTitle: string;
  waitlistPlaceholder: string;
  waitlistEmailAria: string;
  waitlistButton: string;
  waitlistNote: string;
  waitlistSuccess: string;

  /* Footer */
  footerBrandLabel: string;
  footerBrandA: string;
  footerBrandB: string;
  footerStudioLabel: string;
  footerStudioA: string;
  footerStudioB: string;
  footerSocialLabel: string;
  footerContactLabel: string;
  footerOrderLabel: string;
  footerTrackOrder: string;
  footerAdmin: string;
  footerSealTitle: string;
  footerSealMeaning: string;

  /* Produktseite */
  productBack: string;
  productGalleryLabel: string;
  productImageAlt: (alt: string, i: number) => string;
  specFit: string;
  specFitValue: string;
  specFabric: string;
  specPrint: string;
  specPrintValue: string;
  specShipping: string;
  specShippingValue: string;
  notifyNote: string;
  notifyButton: string;

  /* In den Warenkorb */
  sizeGroupAria: string;
  sizeHint: string;
  soldOutHint: string;
  lowStock: (n: number, size: string) => string;
  addToCart: (price: string) => string;
  soldOut: string;

  /* Warenkorb-Schublade */
  cartTitle: string;
  cartAria: string;
  cartEmpty: string;
  cartViewDrop: string;
  cartSize: string;
  cartQtyDown: string;
  cartQtyUp: string;
  cartRemove: string;
  cartSubtotal: string;
  cartShippingNote: string;
  cartCheckout: string;
  cartClose: string;

  /* Checkout */
  checkoutLabel: string;
  checkoutTitle: string;
  checkoutEmpty: string;
  checkoutCancelled: string;
  checkoutPrefilled: string;
  fEmail: string;
  fName: string;
  fStreet: string;
  fZip: string;
  fCity: string;
  phEmail: string;
  phName: string;
  phStreet: string;
  phZip: string;
  phCity: string;
  checkoutPay: (total: string) => string;
  checkoutBusy: string;
  checkoutHint: string;
  summaryTitle: string;
  summarySize: (size: string, qty: number) => string;
  summarySubtotal: string;
  summaryShipping: string;
  summaryTotal: string;
  errors: Record<string, string>;
  errNotOrderable: (name: string) => string;

  /* Bestätigung */
  successLabel: string;
  successTitle: string;
  successSub: string;
  successOrder: string;
  successItem: (name: string, size: string, qty: number) => string;
  successTotal: string;
  backHome: string;

  /* Bestellverfolgung */
  orderLabel: string;
  orderTitle: string;
  orderIntro: string;
  orderIdLabel: (id: string) => string;
  fOrderId: string;
  phOrderId: string;
  orderSubmit: string;
  orderNotFound: string;
  orderLocked: (min: number) => string;
  orderHelpA: string;
  orderHelpB: string;
  orderedOn: string;
  orderItems: string;
  orderSize: (size: string, qty: number) => string;
  orderAddress: string;
  orderShipping: string;
  orderTotal: string;
  orderClose: string;
  orderBackHome: string;
  reorder: string;
  reorderNone: string;
  reorderSkipped: (n: number) => string;
  status: Record<string, { label: string; note: string }>;

  /* Coming Soon */
  csLabel: string;
  csTitle: string;
  csNote: string;
  csPiecesLabel: string;
  /** Markeninhalte auf der Teaser-Seite — Quelle ist der JIZAI-Flyer. */
  teaser: {
    tagline: string;
    whisper: string;
    filmLabel: string;
    filmTitle: string;
    filmCta: string;
    filmYoutubeNote: string;
    brandLabel: string;
    brandTitle: string;
    brandKicker: string;
    brandBody: string;
    brandQuote: string;
    brandQuoteLabel: string;
    brandBody2: string;
    nameLabel: string;
    nameTitle: string;
    nameChars: string;
    nameBody: string;
    pathLabel: string;
    pathTitle: string;
    pathBody: string;
    stages: {
      kanji: string;
      name: string;
      head: string;
      gloss: string;
      line: string;
      body: string;
      quote: string;
    }[];
    codesLabel: string;
    codesTitle: string;
    codes: { n: string; name: string; body: string }[];
  };
}

const de: Dict = {
  htmlLang: "de",
  locale: "de-CH",
  metaTitle: "JIZAI — Begin before the noise.",
  metaDescription:
    "JIZAI — Urban Streetwear, geformt von Disziplin, Bewegung und japanischer Zurückhaltung. Drop 01 · 守破 SHU × HA.",
  orderMetaTitle: "Bestellung verfolgen — JIZAI",
  orderMetaDescription: "Status deiner JIZAI-Bestellung ansehen und Stücke erneut bestellen.",

  navPhilosophy: "Philosophie",
  navDrop: "Drop 01",
  navAbout: "About",
  navCart: "Cart",
  navCartOpen: "Warenkorb öffnen",
  navShuhariSub: "Shu·Ha·Ri",
  langSwitchLabel: "Switch to English",

  heroEyebrow: "Urban streetwear · Liestal, CH",
  heroImgAlt: "JIZAI Oversized Tee — ruhige Bewegung im Nebel",
  heroCaption: "自在 jizai — im eigenen Sein",
  heroScroll: "Scroll",
  heroDropTag: "Drop 01 · 守 SHU — jetzt bestellbar · 破 HA — bald",

  manifestoLabel: "所以 shoi — Warum JIZAI",
  manifestoTitle:
    "Freiheit durch Meisterschaft — nicht durch lautes Auftreten. 自在 heisst: im eigenen Sein. Erst die Form. Dann die Freiheit.",
  manifestoNote: (
    <>
      JIZAI kommt nicht <em>über</em> Japan — JIZAI kommt <em>aus einer Praxis</em>: jahrzehntelang
      gelebte Kampfkunst, der Atem vor der Handlung, die erste Kata des Tages. Fashion ist das
      Produkt. Die Praxis ist der Grund.
    </>
  ),

  pillarsLabel: "Brand Pillars",
  pillars: [
    { k: "形", t: "Form", d: "Disziplin und Präzision. Nichts ist zufällig gesetzt." },
    { k: "息", t: "Breath", d: "Der Atem vor der Handlung. Der ruhige Moment vor dem Tag." },
    { k: "静", t: "Silence", d: "Reduktion statt Lärm. Ruhe und Fokus als Sprache." },
    { k: "匠", t: "Craft", d: "Schwere Stoffe, präzise Konstruktion, Sumi-e-Handschrift. Qualität, die man greift." },
    { k: "響", t: "Sound", d: "Jede Kollektion trägt ihr eigenes Soundscape." },
  ],

  dropLabel: "Drop 01 · 守破 SHU × HA",
  dropTitleA: "Die Form.",
  dropTitleB: "Und ihr Bruch.",
  dropIntro:
    "Zwei Akte, ein Drop: SHU hält die Form — HA bricht sie. Begin in silence. Break with precision.",
  acts: [
    { kanji: "守", title: "Akt I — SHU", sub: "Die Form befolgen · Begin in silence.", state: "Jetzt bestellbar" },
    { kanji: "破", title: "Akt II — HA", sub: "Die Form brechen · Break with precision.", state: "Bald" },
    { kanji: "離", title: "RI", sub: "Die Form transzendieren.", state: "Der Horizont" },
  ],
  kanjiMeaning: {
    "守": "守 SHU — Die Form befolgen",
    "破": "破 HA — Die Form brechen",
    "離": "離 RI — Die Form transzendieren",
  },
  badgeSoon: "BALD VERFÜGBAR",
  badgeSoldOut: "Ausverkauft",
  badgeLeft: (n) => `Nur noch ${n} Stück`,

  shuhariLabel: "Kollektions-Architektur",
  shuhari: [
    { k: "守", n: "SHU", s: "Die Form befolgen", d: "Reduziert, diszipliniert, gehaltene Energie. Begin in silence.", drop: "Drop 01 · Akt I — jetzt bestellbar" },
    { k: "破", n: "HA", s: "Die Form brechen", d: "Bewegung, Kontrast, der Cut als Signatur. Break with precision.", drop: "Drop 01 · Akt II — bald" },
    { k: "離", n: "RI", s: "Die Form transzendieren", d: "自在 selbst — mühelose Freiheit, freie Materialität.", drop: "Der Horizont" },
  ],

  lookbookAlts: [
    "JIZAI Lookbook — stiller Stand",
    "JIZAI Lookbook — Bewegung im Wasser",
    "JIZAI Lookbook — Koi Backprint",
  ],
  lookbookQuote: "The quietest piece in the room — and still the strongest.",

  aboutLeadA: "Vierundvierzig Jahre auf der Matte.",
  aboutLeadB: "Nicht als Sport. Als Weg.",
  aboutText1:
    "Was diese Jahre lehren, steht nicht in einem Satz. Es ist die Form, die man tausendmal wiederholt, bis sie einem gehört. Der Moment, in dem man sie bricht. Und das, was danach bleibt, wenn man aufhört, über sie nachzudenken.",
  aboutKanji: "守 — lernen. 破 — brechen. 離 — frei sein.",
  aboutText2:
    "JIZAI kommt aus diesem Weg. Nicht aus dem Dojo, das man auf ein Shirt druckt, sondern aus dem, was der Weg mit einem macht — über Jahrzehnte, durch alles hindurch.",
  aboutText3:
    "自在 heisst: müheloser Freiraum durch Meisterschaft. Man kommt nie an. Nach vierundvierzig Jahren fängt man immer noch an.",
  aboutClose: "Forty-four years. Still beginning.",

  waitlistLabel: "破 HA — bald bestellbar",
  waitlistTitle: "Sei da, bevor der Lärm beginnt.",
  waitlistPlaceholder: "deine@email.ch",
  waitlistEmailAria: "E-Mail-Adresse",
  waitlistButton: "Join the ritual",
  waitlistNote: "Early Access auf Akt II · kein Spam · nur Drops",
  waitlistSuccess: "ようこそ yōkoso — willkommen. Du bist auf der Liste. Begin before the noise.",

  footerBrandLabel: "Brand",
  footerBrandA: "Urban streetwear shaped by discipline,",
  footerBrandB: "movement and Japanese restraint.",
  footerStudioLabel: "Studio",
  footerStudioA: "Liestal, Schweiz",
  footerStudioB: "Atelier",
  footerSocialLabel: "Social",
  footerContactLabel: "Kontakt",
  footerOrderLabel: "Bestellung",
  footerTrackOrder: "Bestellung verfolgen",
  footerAdmin: "Admin",
  footerSealTitle: "自在 jizai — im eigenen Sein",
  footerSealMeaning: "im eigenen Sein",

  productBack: "← Drop 01 · 守破 SHU × HA",
  productGalleryLabel: "Produktbilder",
  productImageAlt: (alt, i) => `${alt} — Bild ${i}`,
  specFit: "Fit",
  specFitValue: "Oversized, boxy, dropped shoulders",
  specFabric: "Stoff",
  specPrint: "Print",
  specPrintValue: "Siebdruck · kleines 自在-Seal",
  specShipping: "Versand",
  specShippingValue: "CH CHF 9.– · 2–4 Werktage",
  notifyNote: "Bald verfügbar — noch nicht bestellbar. Trag dich ein, wir sagen dir, wenn es losgeht.",
  notifyButton: "Benachrichtigen",

  sizeGroupAria: "Grösse wählen",
  sizeHint: "Bitte zuerst eine Grösse wählen.",
  soldOutHint: "Ausverkauft — trag dich unten in die Waitlist ein.",
  lowStock: (n, size) => `Nur noch ${n} Stück in ${size}.`,
  addToCart: (price) => `In den Warenkorb — ${price}`,
  soldOut: "Ausverkauft",

  cartTitle: "Warenkorb",
  cartAria: "Warenkorb",
  cartEmpty: "Noch still hier drin.",
  cartViewDrop: "Drop 01 ansehen",
  cartSize: "Grösse",
  cartQtyDown: "Menge verringern",
  cartQtyUp: "Menge erhöhen",
  cartRemove: "Entfernen",
  cartSubtotal: "Zwischensumme",
  cartShippingNote: "Versand wird beim Checkout berechnet · CH-Versand CHF 9.–",
  cartCheckout: "Zur Kasse",
  cartClose: "Schliessen",

  checkoutLabel: "Checkout · 結 musubi — verbinden",
  checkoutTitle: "Fast geschafft.",
  checkoutEmpty: "Dein Warenkorb ist leer.",
  checkoutCancelled: "Zahlung abgebrochen — dein Warenkorb wartet noch.",
  checkoutPrefilled: "Adresse aus deiner letzten Bestellung übernommen — du kannst sie ändern.",
  fEmail: "E-Mail",
  fName: "Name",
  fStreet: "Strasse & Nr.",
  fZip: "PLZ",
  fCity: "Ort",
  phEmail: "deine@email.ch",
  phName: "Vor- und Nachname",
  phStreet: "Musterstrasse 1",
  phZip: "4410",
  phCity: "Liestal",
  checkoutPay: (total) => `Bezahlen — ${total}`,
  checkoutBusy: "Einen Atemzug …",
  checkoutHint:
    "Zahlung via Stripe (TWINT, Karte, Apple Pay) — ohne konfigurierten Stripe-Key läuft der Shop im Demo-Modus und simuliert die Zahlung.",
  summaryTitle: "Bestellung",
  summarySize: (size, qty) => `Grösse ${size} · ${qty}×`,
  summarySubtotal: "Zwischensumme",
  summaryShipping: "Versand (CH)",
  summaryTotal: "Total",
  errors: {
    invalid_request: "Ungültige Anfrage",
    cart_empty: "Warenkorb ist leer",
    invalid_email: "Bitte gültige E-Mail angeben",
    address_incomplete: "Bitte Lieferadresse vollständig ausfüllen",
    invalid_qty: "Ungültige Menge",
    product_not_found: "Produkt nicht gefunden",
    out_of_stock: "Nicht mehr genug an Lager — bitte Menge anpassen.",
    payment_failed: "Zahlung konnte nicht gestartet werden",
    unknown: "Etwas ist schiefgelaufen",
  },
  errNotOrderable: (name) => `${name} ist noch nicht bestellbar (bald verfügbar)`,

  successLabel: "ありがとう arigatō — Danke",
  successTitle: "Deine Bestellung ist da.",
  successSub:
    "Begin before the noise — wir packen dein Stück mit Ruhe und Sorgfalt. Du erhältst eine Bestätigung per E-Mail.",
  successOrder: "Bestellung",
  successItem: (name, size, qty) => `${name} · Grösse ${size} · ${qty}×`,
  successTotal: "Total inkl. Versand",
  backHome: "Zurück zur Startseite",

  orderLabel: "Bestellung verfolgen",
  orderTitle: "Wo ist mein Stück?",
  orderIntro:
    "Gib deine E-Mail und die Bestellnummer aus der Bestätigungsmail ein. Kein Konto nötig.",
  orderIdLabel: (id) => `Bestellung ${id}`,
  fOrderId: "Bestellnummer",
  phOrderId: "jz_xxxxxxxx",
  orderSubmit: "Bestellung anzeigen",
  orderNotFound: "Keine Bestellung gefunden. Prüfe E-Mail und Bestellnummer.",
  orderLocked: (min) => `Zu viele Versuche. Bitte ${min} Min warten.`,
  orderHelpA: "Nummer verlegt? Schreib uns an",
  orderHelpB: "— wir finden sie.",
  orderedOn: "Bestellt am",
  orderItems: "Artikel",
  orderSize: (size, qty) => `Grösse ${size} · ${qty}×`,
  orderAddress: "Lieferadresse",
  orderShipping: "Versand",
  orderTotal: "Total",
  orderClose: "Ansicht schliessen",
  orderBackHome: "← Zur Startseite",
  reorder: "Nochmals bestellen",
  reorderNone: "Keine Artikel dieser Bestellung sind aktuell bestellbar.",
  reorderSkipped: (n) =>
    n === 1
      ? "Ein Artikel ist derzeit nicht bestellbar und wurde ausgelassen."
      : `${n} Artikel sind derzeit nicht bestellbar und wurden ausgelassen.`,
  status: {
    pending: { label: "Zahlung ausstehend", note: "Wir haben deine Bestellung, warten aber noch auf den Zahlungseingang." },
    paid: { label: "Bezahlt", note: "Zahlung eingegangen. Dein Stück wird für den Versand vorbereitet." },
    shipped: { label: "Versendet", note: "Unterwegs zu dir." },
    cancelled: { label: "Storniert", note: "Diese Bestellung wurde storniert." },
  },

  csLabel: "Drop 01 · 守破 SHU × HA",
  csTitle: "Bald.",
  csNote: "Trag dich ein und erfahre als Erste:r, wenn der Drop öffnet. Kein Spam, nur Drops.",
  csPiecesLabel: "Drop 01 · Erste Stücke",
  teaser: {
    tagline: "Premium budo-rooted urban streetwear",
    whisper: "Jede Zeile muss auch geflüstert funktionieren",

    filmLabel: "Der Film",
    filmTitle: "Controlled force.",
    filmCta: "Film ansehen",
    filmYoutubeNote: "Der Film startet über YouTube — vorher wird nichts geladen.",

    brandLabel: "01 · Die Marke",
    brandTitle: "Was JIZAI ist",
    brandKicker: "Core Brand Promise",
    brandBody:
      "JIZAI ist eine premiumorientierte Urban-Streetwear-Marke, verwurzelt in jahrzehntelanger japanischer Kampfkunstpraxis. Die Marke übersetzt Disziplin, Wiederholung, Atem und kontrollierte Bewegung in Kleidung mit starker Silhouette, präziser Grafik und klaren materiellen Codes.",
    brandQuote: "The quietest piece in the room. The strongest presence.",
    brandQuoteLabel: "Controlled force",
    brandBody2:
      "Der Kern ist nicht Japan als Oberfläche — der Kern ist die Praxis. Fashion-first: kein Merch, kein Anime, kein Souvenir-Japan, kein Wellness-Kitsch. Kontrollierte Ruhe mit urbaner Spannung.",

    nameLabel: "02 · Der Name",
    nameTitle: "自在 · Freedom through mastery",
    nameChars:
      "自 „ji“ — selbst, aus sich heraus · 在 „zai“ — sein, da sein · wörtlich: aus sich selbst heraus sein",
    nameBody:
      "Im Gebrauch heisst 自在 frei, ungehindert, nach eigenem Belieben. Für die Marke wird daraus „Freedom through mastery“: Freiheit als Ergebnis von Form, Wiederholung und Beherrschung — nicht Freiheit von etwas. Erst wird die Form gelernt, dann gebrochen, schliesslich transzendiert. Discipline before noise.",

    pathLabel: "03 · Lernweg und Kollektions-Architektur",
    pathTitle: "SHU · HA · RI — was es bedeutet",
    pathBody:
      "守破離 (shu–ha–ri) beschreibt in den traditionellen japanischen Künsten — im Budo, im Teeweg, im Nō-Theater — die drei Stufen des Lernens. Man übernimmt die Form exakt, man bricht sie bewusst, man löst sich von ihr. Am Ende ist die Form nicht verschwunden, sondern in den Körper übergegangen: Man handelt frei, ohne sie zu verlassen. Genau das ist 自在. Bei JIZAI ist SHU–HA–RI deshalb beides — Lernweg der Praxis und Architektur der Kollektionen.",
    stages: [
      {
        kanji: "守",
        name: "SHU",
        head: "Die Form halten",
        gloss: "守 „shu“ — bewahren, schützen, befolgen",
        line: "Die Form befolgen.",
        body: "Reduziert und diszipliniert: Core Codes, klare Silhouetten, maximaler Negativraum. Die Herkunft und die Ruhe der Marke.",
        quote: "Begin in silence.",
      },
      {
        kanji: "破",
        name: "HA",
        head: "Die Form brechen",
        gloss: "破 „ha“ — brechen, lösen, durchbrechen",
        line: "Die Form brechen.",
        body: "Kontrast, Cut, Rhythmus, stärkere Grafik und hybride Konstruktion. Der Bruch ist präzise gesetzt — nie zerstörerisch.",
        quote: "Break with precision.",
      },
      {
        kanji: "離",
        name: "RI",
        head: "Die Form verlassen",
        gloss: "離 „ri“ — sich lösen, trennen, verlassen",
        line: "Die Form transzendieren.",
        body: "Freie Materialität, fortgeschrittene Pieces, Kollaboration, mühelose Eigenständigkeit. Nicht lauter — müheloser.",
        quote: "RI bleibt der Horizont späterer Drops.",
      },
    ],

    codesLabel: "04 · Das JIZAI Brand-Code-System",
    codesTitle: "Fünf Codes, die jedes Stück tragen",
    codes: [
      { n: "01", name: "JIZAI Cut", body: "Ein präziser Unterbruch durch Form, Typografie oder Konstruktion." },
      { n: "02", name: "Red Seal 自在", body: "Kleines 自在-Siegel als handwerkliche Signatur. Nie dominant." },
      { n: "03", name: "Kana ジザイ", body: "Vertikales ジザイ als leises Insider-Element auf Sleeve oder Naht." },
      { n: "04", name: "Controlled Asymmetry", body: "Optische Spannung durch versetzte Balance, nicht durch Verzerrung." },
      { n: "05", name: "Material Mark", body: "Wiederkehrendes Verstärkungs- oder Texturdetail." },
    ],
  },
};

const en: Dict = {
  htmlLang: "en",
  locale: "en-CH",
  metaTitle: "JIZAI — Begin before the noise.",
  metaDescription:
    "JIZAI — urban streetwear shaped by discipline, movement and Japanese restraint. Drop 01 · 守破 SHU × HA.",
  orderMetaTitle: "Track your order — JIZAI",
  orderMetaDescription: "Check the status of your JIZAI order and order pieces again.",

  navPhilosophy: "Philosophy",
  navDrop: "Drop 01",
  navAbout: "About",
  navCart: "Cart",
  navCartOpen: "Open cart",
  navShuhariSub: "Shu·Ha·Ri",
  langSwitchLabel: "Auf Deutsch wechseln",

  heroEyebrow: "Urban streetwear · Liestal, CH",
  heroImgAlt: "JIZAI oversized tee — quiet movement in the mist",
  heroCaption: "自在 jizai — within one's own being",
  heroScroll: "Scroll",
  heroDropTag: "Drop 01 · 守 SHU — available now · 破 HA — soon",

  manifestoLabel: "所以 shoi — Why JIZAI",
  manifestoTitle:
    "Freedom through mastery — not through volume. 自在 means: within one's own being. First the form. Then the freedom.",
  manifestoNote: (
    <>
      JIZAI isn&apos;t <em>about</em> Japan — JIZAI comes <em>out of a practice</em>: decades of
      lived martial arts, the breath before the action, the first kata of the day. Fashion is the
      product. The practice is the reason.
    </>
  ),

  pillarsLabel: "Brand Pillars",
  pillars: [
    { k: "形", t: "Form", d: "Discipline and precision. Nothing is placed by chance." },
    { k: "息", t: "Breath", d: "The breath before the action. The quiet moment before the day." },
    { k: "静", t: "Silence", d: "Reduction instead of noise. Calm and focus as a language." },
    { k: "匠", t: "Craft", d: "Heavy fabrics, precise construction, a sumi-e hand. Quality you can feel." },
    { k: "響", t: "Sound", d: "Every collection carries its own soundscape." },
  ],

  dropLabel: "Drop 01 · 守破 SHU × HA",
  dropTitleA: "The form.",
  dropTitleB: "And its break.",
  dropIntro:
    "Two acts, one drop: SHU holds the form — HA breaks it. Begin in silence. Break with precision.",
  acts: [
    { kanji: "守", title: "Act I — SHU", sub: "Follow the form · Begin in silence.", state: "Available now" },
    { kanji: "破", title: "Act II — HA", sub: "Break the form · Break with precision.", state: "Soon" },
    { kanji: "離", title: "RI", sub: "Transcend the form.", state: "The horizon" },
  ],
  kanjiMeaning: {
    "守": "守 SHU — Follow the form",
    "破": "破 HA — Break the form",
    "離": "離 RI — Transcend the form",
  },
  badgeSoon: "COMING SOON",
  badgeSoldOut: "Sold out",
  badgeLeft: (n) => `Only ${n} left`,

  shuhariLabel: "Collection architecture",
  shuhari: [
    { k: "守", n: "SHU", s: "Follow the form", d: "Reduced, disciplined, contained energy. Begin in silence.", drop: "Drop 01 · Act I — available now" },
    { k: "破", n: "HA", s: "Break the form", d: "Movement, contrast, the cut as a signature. Break with precision.", drop: "Drop 01 · Act II — soon" },
    { k: "離", n: "RI", s: "Transcend the form", d: "自在 itself — effortless freedom, free materiality.", drop: "The horizon" },
  ],

  lookbookAlts: [
    "JIZAI lookbook — quiet stance",
    "JIZAI lookbook — movement in water",
    "JIZAI lookbook — koi backprint",
  ],
  lookbookQuote: "The quietest piece in the room — and still the strongest.",

  aboutLeadA: "Forty-four years on the mat.",
  aboutLeadB: "Not as a sport. As a way.",
  aboutText1:
    "What those years teach doesn't fit into a sentence. It's the form you repeat a thousand times until it becomes yours. The moment you break it. And what remains once you stop thinking about it.",
  aboutKanji: "守 — learn. 破 — break. 離 — become free.",
  aboutText2:
    "JIZAI comes from that way. Not from a dojo printed on a shirt, but from what the way does to a person — over decades, through everything.",
  aboutText3:
    "自在 means: effortless freedom through mastery. You never arrive. After forty-four years, you are still beginning.",
  aboutClose: "Forty-four years. Still beginning.",

  waitlistLabel: "破 HA — available soon",
  waitlistTitle: "Be there before the noise begins.",
  waitlistPlaceholder: "your@email.com",
  waitlistEmailAria: "Email address",
  waitlistButton: "Join the ritual",
  waitlistNote: "Early access to Act II · no spam · drops only",
  waitlistSuccess: "ようこそ yōkoso — welcome. You're on the list. Begin before the noise.",

  footerBrandLabel: "Brand",
  footerBrandA: "Urban streetwear shaped by discipline,",
  footerBrandB: "movement and Japanese restraint.",
  footerStudioLabel: "Studio",
  footerStudioA: "Liestal, Switzerland",
  footerStudioB: "Atelier",
  footerSocialLabel: "Social",
  footerContactLabel: "Contact",
  footerOrderLabel: "Order",
  footerTrackOrder: "Track your order",
  footerAdmin: "Admin",
  footerSealTitle: "自在 jizai — within one's own being",
  footerSealMeaning: "within one's own being",

  productBack: "← Drop 01 · 守破 SHU × HA",
  productGalleryLabel: "Product images",
  productImageAlt: (alt, i) => `${alt} — image ${i}`,
  specFit: "Fit",
  specFitValue: "Oversized, boxy, dropped shoulders",
  specFabric: "Fabric",
  specPrint: "Print",
  specPrintValue: "Screen print · small 自在 seal",
  specShipping: "Shipping",
  specShippingValue: "CH CHF 9.– · 2–4 working days",
  notifyNote: "Coming soon — not orderable yet. Sign up and we'll tell you the moment it opens.",
  notifyButton: "Notify me",

  sizeGroupAria: "Choose a size",
  sizeHint: "Please choose a size first.",
  soldOutHint: "Sold out — join the waitlist below.",
  lowStock: (n, size) => `Only ${n} left in ${size}.`,
  addToCart: (price) => `Add to cart — ${price}`,
  soldOut: "Sold out",

  cartTitle: "Cart",
  cartAria: "Cart",
  cartEmpty: "Still quiet in here.",
  cartViewDrop: "View Drop 01",
  cartSize: "Size",
  cartQtyDown: "Decrease quantity",
  cartQtyUp: "Increase quantity",
  cartRemove: "Remove",
  cartSubtotal: "Subtotal",
  cartShippingNote: "Shipping calculated at checkout · CH shipping CHF 9.–",
  cartCheckout: "Checkout",
  cartClose: "Close",

  checkoutLabel: "Checkout · 結 musubi — to connect",
  checkoutTitle: "Almost there.",
  checkoutEmpty: "Your cart is empty.",
  checkoutCancelled: "Payment cancelled — your cart is still waiting.",
  checkoutPrefilled: "Address taken from your last order — you can change it.",
  fEmail: "Email",
  fName: "Name",
  fStreet: "Street & no.",
  fZip: "Postcode",
  fCity: "City",
  phEmail: "your@email.com",
  phName: "First and last name",
  phStreet: "Example Street 1",
  phZip: "4410",
  phCity: "Liestal",
  checkoutPay: (total) => `Pay — ${total}`,
  checkoutBusy: "One breath …",
  checkoutHint:
    "Payment via Stripe (TWINT, card, Apple Pay) — without a configured Stripe key the shop runs in demo mode and simulates the payment.",
  summaryTitle: "Order",
  summarySize: (size, qty) => `Size ${size} · ${qty}×`,
  summarySubtotal: "Subtotal",
  summaryShipping: "Shipping (CH)",
  summaryTotal: "Total",
  errors: {
    invalid_request: "Invalid request",
    cart_empty: "Your cart is empty",
    invalid_email: "Please enter a valid email address",
    address_incomplete: "Please complete the delivery address",
    invalid_qty: "Invalid quantity",
    product_not_found: "Product not found",
    out_of_stock: "Not enough left in stock — please adjust the quantity.",
    payment_failed: "The payment could not be started",
    unknown: "Something went wrong",
  },
  errNotOrderable: (name) => `${name} is not orderable yet (coming soon)`,

  successLabel: "ありがとう arigatō — Thank you",
  successTitle: "Your order is in.",
  successSub:
    "Begin before the noise — we pack your piece with care. You'll receive a confirmation by email.",
  successOrder: "Order",
  successItem: (name, size, qty) => `${name} · size ${size} · ${qty}×`,
  successTotal: "Total incl. shipping",
  backHome: "Back to home",

  orderLabel: "Track your order",
  orderTitle: "Where is my piece?",
  orderIntro:
    "Enter your email and the order number from your confirmation email. No account needed.",
  orderIdLabel: (id) => `Order ${id}`,
  fOrderId: "Order number",
  phOrderId: "jz_xxxxxxxx",
  orderSubmit: "Show order",
  orderNotFound: "No order found. Check the email address and order number.",
  orderLocked: (min) => `Too many attempts. Please wait ${min} min.`,
  orderHelpA: "Lost the number? Write to us at",
  orderHelpB: "— we'll find it.",
  orderedOn: "Ordered on",
  orderItems: "Items",
  orderSize: (size, qty) => `Size ${size} · ${qty}×`,
  orderAddress: "Delivery address",
  orderShipping: "Shipping",
  orderTotal: "Total",
  orderClose: "Close view",
  orderBackHome: "← Back to home",
  reorder: "Order again",
  reorderNone: "None of the items in this order are currently available.",
  reorderSkipped: (n) =>
    n === 1
      ? "One item is currently unavailable and was left out."
      : `${n} items are currently unavailable and were left out.`,
  status: {
    pending: { label: "Payment pending", note: "We have your order, but are still waiting for the payment." },
    paid: { label: "Paid", note: "Payment received. Your piece is being prepared for shipping." },
    shipped: { label: "Shipped", note: "On its way to you." },
    cancelled: { label: "Cancelled", note: "This order was cancelled." },
  },

  csLabel: "Drop 01 · 守破 SHU × HA",
  csTitle: "Soon.",
  csNote: "Sign up and be the first to know when the drop opens. No spam, drops only.",
  csPiecesLabel: "Drop 01 · First pieces",
  teaser: {
    tagline: "Premium budo-rooted urban streetwear",
    whisper: "Every line must work when whispered",

    filmLabel: "The film",
    filmTitle: "Controlled force.",
    filmCta: "Watch the film",
    filmYoutubeNote: "The film plays via YouTube — nothing is loaded until you press play.",

    brandLabel: "01 · The brand",
    brandTitle: "What JIZAI is",
    brandKicker: "Core brand promise",
    brandBody:
      "JIZAI is a premium urban streetwear brand rooted in decades of Japanese martial arts practice. It translates discipline, repetition, breath and controlled movement into clothing with a strong silhouette, precise graphics and clear material codes.",
    brandQuote: "The quietest piece in the room. The strongest presence.",
    brandQuoteLabel: "Controlled force",
    brandBody2:
      "The core is not Japan as a surface — the core is the practice. Fashion-first: no merch, no anime, no souvenir Japan, no wellness kitsch. Controlled calm with urban tension.",

    nameLabel: "02 · The name",
    nameTitle: "自在 · Freedom through mastery",
    nameChars:
      "自 ‘ji’ — self, from oneself · 在 ‘zai’ — to be, to be present · literally: to exist from oneself",
    nameBody:
      "In use, 自在 means free, unhindered, at one’s own will. For the brand it becomes “Freedom through mastery”: freedom as the result of form, repetition and command — not freedom from something. First the form is learned, then broken, finally transcended. Discipline before noise.",

    pathLabel: "03 · Path of learning and collection architecture",
    pathTitle: "SHU · HA · RI — what it means",
    pathBody:
      "守破離 (shu–ha–ri) describes the three stages of learning in the traditional Japanese arts — in budo, in the way of tea, in Nō theatre. You follow the form exactly, you deliberately break it, you detach from it. In the end the form has not disappeared; it has passed into the body, so you act freely without ever leaving it. That is precisely 自在. For JIZAI, SHU–HA–RI is therefore both — the path of the practice and the architecture of the collections.",
    stages: [
      {
        kanji: "守",
        name: "SHU",
        head: "Hold the form",
        gloss: "守 ‘shu’ — to keep, protect, obey",
        line: "Follow the form.",
        body: "Reduced and disciplined: core codes, clear silhouettes, maximum negative space. The origin and the calm of the brand.",
        quote: "Begin in silence.",
      },
      {
        kanji: "破",
        name: "HA",
        head: "Break the form",
        gloss: "破 ‘ha’ — to break, detach, cut through",
        line: "Break the form.",
        body: "Contrast, cut, rhythm, stronger graphics and hybrid construction. The break is placed with precision — never destructive.",
        quote: "Break with precision.",
      },
      {
        kanji: "離",
        name: "RI",
        head: "Leave the form",
        gloss: "離 ‘ri’ — to separate, release, leave",
        line: "Transcend the form.",
        body: "Free materiality, advanced pieces, collaboration, effortless independence. Not louder — more effortless.",
        quote: "RI remains the horizon of later drops.",
      },
    ],

    codesLabel: "04 · The JIZAI brand code system",
    codesTitle: "Five codes every piece carries",
    codes: [
      { n: "01", name: "JIZAI Cut", body: "A precise interruption through form, typography or construction." },
      { n: "02", name: "Red Seal 自在", body: "A small 自在 seal as a craft signature. Never dominant." },
      { n: "03", name: "Kana ジザイ", body: "Vertical ジザイ as a quiet insider element on sleeve or seam." },
      { n: "04", name: "Controlled Asymmetry", body: "Optical tension through offset balance, not through distortion." },
      { n: "05", name: "Material Mark", body: "A recurring reinforcement or texture detail." },
    ],
  },
};

const DICTS: Record<Lang, Dict> = { de, en };

export function t(lang: Lang): Dict {
  return DICTS[lang] ?? de;
}
