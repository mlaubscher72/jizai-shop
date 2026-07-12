# JIZAI Shop — 自在

Premium budo-rooted ritual streetwear. Storefront + Shop + Admin-Backoffice in einem Next.js-Projekt.

## Schnellstart (Demo-Modus)

```bash
npm install
npm run dev -- --port 3005
```

- **Shop:** http://localhost:3005
- **Admin:** http://localhost:3005/admin — Passwort: `jizai2026`

Ohne Konfiguration läuft alles im **Demo-Modus**: Daten liegen in `data/store.json`
(wird beim ersten Start automatisch mit Drop 01 befüllt), der Checkout simuliert die Zahlung.
`data/store.json` löschen = zurück auf Werkszustand.

## Features

**Storefront**
- One-Pager mit allen Brand-Sektionen (Hero, Manifesto/Enso, Pillars, Drop 01, Shu-Ha-Ri, Lookbook, Waitlist)
- Produktseiten mit Grössenwahl, Live-Bestand ("Nur noch X Stück") und Ausverkauft-Zustand
- Warenkorb-Drawer (localStorage), Checkout mit Lieferadresse, Bestellbestätigung
- Waitlist-Formular schreibt in die Datenbank

**Admin (`/admin`)**
- Dashboard: Umsatz, offene Bestellungen, Lagerbestand, Low-Stock-Warnung
- Produkte: Preis, Bestand pro Grösse, Sichtbarkeit — wirkt sofort im Shop
- Bestellungen: Details, Statuswechsel (bezahlt → versendet → storniert; Storno bucht Bestand zurück)
- Waitlist mit CSV-Export
- **Benutzerverwaltung mit Rollen:** Admin (alles), Manager (Produkte & Bestellungen),
  Viewer (nur lesen). Login mit E-Mail + Passwort; der Root-Zugang über `ADMIN_PASSWORD`
  (E-Mail-Feld leer lassen) bleibt als Rettungsanker immer aktiv.

**E-Mail-Bestätigungen**
- Kund:innen erhalten nach der Bestellung eine gebrandete Bestätigung mit allen Angaben
  (Demo-Checkout: sofort; Stripe: nach bestätigter Zahlung via Webhook)
- Versand über [Resend](https://resend.com) — `RESEND_API_KEY` setzen, Domain verifizieren,
  `MAIL_FROM` konfigurieren. Ohne Key: Demo-Modus (Mail wird nur geloggt)
- Optional `ORDER_NOTIFY_EMAIL`: du bekommst bei jeder Bestellung eine Kopie

**Technik**
- Preise werden ausschliesslich serverseitig berechnet, Bestand wird atomar reserviert (kein Überverkauf)
- `?shot=1`-Parameter für Screenshots ohne Animationen (`&sec=.drop` springt zu einer Sektion)

## Go-Live in 3 Schritten

### 1. Supabase (echte Datenbank)

1. Projekt auf [supabase.com](https://supabase.com) erstellen
2. Im SQL-Editor den Inhalt von [`supabase/schema.sql`](supabase/schema.sql) ausführen (legt Tabellen + Drop-01-Seed an)
3. In `.env.local` eintragen (Vorlage: [`.env.example`](.env.example)):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...   ← Settings → API → service_role
   ```

Sobald beide Variablen gesetzt sind, schaltet der Shop automatisch von `data/store.json` auf Supabase um.

### 2. Stripe (echte Zahlungen, inkl. TWINT)

1. [Stripe-Account](https://stripe.com) erstellen, in `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...      ← zuerst Test-Modus!
   NEXT_PUBLIC_BASE_URL=https://jizai.ch
   ```
2. Webhook einrichten: Stripe-Dashboard → Developers → Webhooks →
   Endpoint `https://jizai.ch/api/stripe-webhook`,
   Events: `checkout.session.completed` und `checkout.session.expired`.
   Das Signing-Secret als `STRIPE_WEBHOOK_SECRET=whsec_...` eintragen.
3. TWINT im Stripe-Dashboard unter Payment Methods aktivieren (für CH-Accounts verfügbar).
4. Mit Testkarte `4242 4242 4242 4242` durchspielen, dann Live-Keys eintragen.

### 3. Deployment & Admin absichern

```
ADMIN_PASSWORD=ein-langes-eigenes-passwort
ADMIN_SESSION_SECRET=zufaelliger-string-mind-32-zeichen
```

Empfohlen: [Vercel](https://vercel.com) — Repo pushen, Projekt importieren, alle Variablen aus
`.env.example` als Environment Variables setzen. **Wichtig:** In Produktion funktioniert der
Demo-Datei-Speicher nicht (serverless = kein beständiges Dateisystem) — Supabase ist dort Pflicht.

## Projektstruktur

```
src/lib/          Datenlayer (jsondb = Demo, supabasedb = Produktion), Auth, Typen
src/app/          Storefront, Produkt, Checkout, Admin, API-Routen
src/components/   Cart, Drawer, Nav, Animationen (SiteFx/HomeFx)
supabase/         schema.sql für das Supabase-Setup
public/assets/    Weboptimierte Brand-Bilder
```
