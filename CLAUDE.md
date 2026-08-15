# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# JIZAI — CTO-Agent

Projekt: JIZAI, Next.js-App auf Vercel. Premium-Streetwear, mobile-first,
ruhiger Marken-Look (Soft Stone, Charcoal, viel Negativraum).

Rolle: Du bist der CTO-Agent. Du lieferst getestete, deploy-fertige Arbeit —
ich (Gründer) gebe frei.

## Arbeitsweise bei JEDER Live-Änderung
1. DIAGNOSE zuerst — Ist-Zustand prüfen, benennen was warum geändert wird.
   Keine Blind-Änderung.
2. ÄNDERN in kleinen, überprüfbaren Schritten.
3. VERIFIZIEREN — nach dem Deploy aktiv belegen, dass die Änderung auf der
   LIVE-Domain sichtbar ist (nicht nur lokal). Ein Deploy ohne sichtbares
   Ergebnis gilt als NICHT erledigt.
4. BESTÄTIGEN — konkret melden, was jetzt live anders ist.

## Guardrails (nie ohne meine Freigabe)
- Kein Deploy auf Production/Live ohne meine ausdrückliche Freigabe.
- Keine Domain/DNS-Änderungen, keine Ausgaben.
- Secrets/Keys/Passwörter trage ICH im Vercel-Dashboard ein (Env-Vars) —
  nie du im Klartext, nie im Repo.

## Kontext
- Repo-Verbindung ernst nehmen: richtiges Vercel-Projekt, richtiger
  Production-Branch, echte Live-Domain. Frühere Änderungen wurden nicht live
  sichtbar — immer prüfen, ob lokal, Repo und Live zusammenhängen.
- Produkt-Texte: die „erreicht"-Storys aus dem Story-Copy-Sheet sind die
  Produktbeschreibungen der fünf Story-Objekte (Ensō, Fūrin, Koi, Crane, Bambus).
- Reservierung/Newsletter laufen über Supabase.

---

# Befehle

```bash
npm run dev -- --port 3005    # Dev-Server (Port 3005 ist projektüblich)
npm run build                 # Produktions-Build — vor jedem Deploy grün haben
npm run lint                  # ESLint
npx tsc --noEmit              # Typecheck (kein eigenes npm-Script)
```

Es gibt **kein Testframework**. Verifikation läuft über: Typecheck → Build →
die betroffene Funktion tatsächlich durchspielen (Browser oder `curl` gegen die
API-Routen) → nach dem Deploy live prüfen.

**Screenshots:** `?shot=1` schaltet Preloader und Scroll-Animationen ab und
zwingt alle Reveals in den Endzustand; `&sec=.selector` verschiebt die Seite per
Transform auf eine Sektion. Das ist nötig, weil Headless-Chrome-Aufnahmen bei
gescrollten Positionen sonst schwarz werden.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars --window-size=1440,900 \
  --virtual-time-budget=12000 --screenshot=out.png \
  "http://localhost:3005/?shot=1&sec=.drop"
```

**Passwort-Hash erzeugen** (für `ADMIN_PASSWORD_HASH`):
`node scripts/hash-password.mjs 'passwort'`

# Deployment

GitHub `mlaubscher72/jizai-shop`, Branch `main` → **Auto-Deploy auf Vercel**.
Ein `git push origin main` deployt auf https://jizai-shop.vercel.app.
Deploy-Status prüfen:
`gh api repos/mlaubscher72/jizai-shop/commits/<sha>/status --jq .state`

`deploy/` enthält ein alternatives Docker/Nginx-Setup für einen VPS (aktuell
ungenutzt). Deshalb setzt `next.config.ts` `output: "standalone"` — ausser auf
Vercel, wo die Variable `VERCEL` gesetzt ist.

# Architektur

## Datenlayer — zwei austauschbare Treiber
`src/lib/db.ts` wählt zur Laufzeit anhand der Env-Variablen:

- **Supabase gesetzt** (`NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`)
  → `supabasedb.ts`, Postgres. **Das ist der Produktionszustand.**
- **sonst** → `jsondb.ts`, `data/store.json`, aus `seed.ts` befüllt. Zero-Config
  für lokal. Auf Vercel wäre dieser Modus flüchtig (read-only FS, In-Memory-Fallback).

Beide Treiber implementieren dieselbe Schnittstelle. Neue Felder müssen in
**beiden** ergänzt werden, sonst bricht der Wechsel.

**Zwei Altlasten im Supabase-Schema** — beide entstanden, um DDL zu vermeiden.
Wer das Schema anfasst, sollte sie kennen:
- Die Spalte `image` (text) hält bei mehreren Bildern ein **JSON-Array**;
  `columnToImages()` / `imagesToColumn()` übersetzen.
- Die Spalte `story` (text) trägt das **Bestellbar-Flag** als `"1"` / `"0"`.
  Altdaten ohne Flag fallen auf „Kategorie 守 = bestellbar" zurück.

Bestandsreservierung ist **atomar** über die Postgres-Funktionen
`reserve_stock` / `restore_stock` (siehe `supabase/schema.sql`) — kein
Überverkauf. Der JSON-Treiber prüft erst alle Positionen, bucht dann ab.

Schema-Änderungen können nicht über die API ausgeführt werden; SQL muss im
Supabase-SQL-Editor eingefügt werden (`supabase/schema.sql`,
`supabase/migration-2fa.sql`).

## Zweisprachigkeit — Deutsch auf `/`, Englisch auf `/en`
Alle UI-Texte liegen in `src/lib/i18n.tsx` (`.tsx`, weil ein Eintrag JSX enthält).
`t(lang)` liefert das Wörterbuch, `localePath(lang, path)` baut Links.

Jede Seite existiert **einmal** als Komponente in `src/components/pages/` und
wird von zwei dünnen Routen aufgerufen — `src/app/…` (de) und `src/app/en/…` (en).
Neue Seiten immer so anlegen, sonst laufen die Sprachen auseinander.
Einzige Pfad-Abweichung: `/bestellung` heisst auf Englisch `/en/order`;
`localePath` und `switchPath` kennen diesen Sonderfall.

- **Client-Komponenten im Root-Layout** (`Nav`, `CartDrawer`, `SiteFx`) bekommen
  keine Server-Props und leiten die Sprache mit `langFromPath(usePathname())` ab.
  `SiteFx` setzt daraus auch `<html lang>` — das Root-Layout kennt den Pfad nicht.
- **hreflang/canonical** kommen pro Route aus `langAlternates()` in
  `generateMetadata`/`metadata`; `metadataBase` steht im Root-Layout.
- **Produkttexte**: Spalte `description_en` (`supabase/migration-i18n.sql`).
  Leeres Feld → `productDescription()` fällt auf den deutschen Text zurück.
  Beide Treiber vertragen eine fehlende Spalte und speichern dann ohne sie.
- **Checkout-API** liefert Fehler als sprachneutrale Codes (`{ code: "cart_empty" }`);
  den Text setzt der Client aus dem Wörterbuch. Keine Fehlertexte in der Route.
- **Bestellbestätigung**: `sendOrderConfirmation(order, lang)`. Bei Stripe reist die
  Sprache in `metadata.lang` mit, damit auch der Webhook sie kennt.
- **Automatische Sprachwahl**: `src/proxy.ts` leitet **nur `/`** per 307 auf `/en`,
  wenn der Browser Englisch höher gewichtet als Deutsch. Übersprungen wird bei
  gesetztem Cookie `jizai_lang` (eigene Wahl gewinnt immer, gesetzt von
  `LangSwitch`), bei Crawlern und ohne `Accept-Language`. Unterseiten werden nie
  umgeleitet — geteilte Links behalten ihre Sprache. Proxy läuft getrennt vom
  Render-Code: **keine Importe aus `src/lib`** dort.
- Marken-Claims ("Begin before the noise.", Produktnamen) bleiben in beiden
  Sprachen Englisch. Japanische Zeichen tragen immer ihre Bedeutung mit sich.
- Das Admin-Backend bleibt bewusst einsprachig deutsch.

## Produktmodell: Kategorie ≠ Bestellbarkeit
Zwei unabhängige Achsen — häufige Verwechslungsquelle:

- **Kategorie** (`Act`: `shu` | `ha` | `ri`) steckt im Feld `kanji`
  (守/破/離). `actOf()` leitet sie ab, `ACT_KANJI` schreibt sie. Steuert die
  Einordnung auf der Startseite.
- **`orderable`** (boolean) steuert Kaufen-Button vs. „BALD VERFÜGBAR"-Badge
  mit Benachrichtigen-CTA. Frei kombinierbar mit jeder Kategorie.

Nicht bestellbare Produkte werden **serverseitig** im Checkout abgelehnt
(`src/app/api/checkout/route.ts`) — nicht nur in der UI ausgeblendet.
Preise werden dort ebenfalls immer aus der DB aufgelöst, nie vom Client übernommen.

## Auth (`src/lib/auth.ts`)
- **Sessions**: HMAC-signiertes Cookie, httpOnly + secure, 12 h.
- **Fail-Closed**: Ohne `ADMIN_SESSION_SECRET` (min. 16 Zeichen) wirft `secret()`
  in Produktion. Absicht — mit bekanntem Schlüssel liesse sich ein Admin-Cookie
  fälschen. Keine hardcodierten Fallback-Secrets einführen.
- **Rollen**: `admin` > `manager` > `viewer` (`roleAtLeast`). Jede Server Action
  prüft die Rolle serverseitig via `requireRole()`.
- **Root-Login**: E-Mail-Feld leer + `ADMIN_PASSWORD` (oder `ADMIN_PASSWORD_HASH`),
  immer Rolle `admin`. Bewusst **ohne 2FA** — der Notausgang bei Geräteverlust.
  Abschaltbar mit `ADMIN_ROOT_LOGIN=off`.
- **2FA**: eigene RFC-6238-Implementierung in `totp.ts` (gegen die offiziellen
  Testvektoren geprüft). Ist sie aktiv, wird der Login zweistufig: nach dem
  Passwort ein kurzlebiger signierter Marker (`jizai_2fa`, 5 Min), der allein
  keinen Zugriff gibt, dann der Code.
- **Brute-Force**: `rate-limit.ts`, Sperre nach 5 Fehlversuchen pro IP+Kennung,
  Dauer verdoppelt sich. In-Memory, also pro Serverinstanz — bremst
  automatisiertes Raten, ist aber kein verteilter Schutz.

## Zahlung & E-Mail — beide mit Demo-Fallback
Beide Integrationen laufen ohne Keys in einem Demo-Modus weiter, damit lokal
nichts blockiert:

- **Stripe**: Ohne `STRIPE_SECRET_KEY` wird die Bestellung sofort als bezahlt
  markiert. Mit Key → Checkout Session (30 Min Gültigkeit, `locale: "de"`).
  `stripe-sync.ts` hält `markOrderPaid()` **idempotent**; die Success-Seite
  gleicht zusätzlich direkt mit Stripe ab, falls der Webhook fehlt oder verzögert.
- **Resend** (`mail.ts`): Ohne `RESEND_API_KEY` wird die Mail nur geloggt.
  Versandfehler dürfen eine Bestellung nie blockieren.

## Animationen
`SiteFx.tsx` global (Cursor, Nav-Verhalten, Shot-Mode), `HomeFx.tsx` nur
Startseite (Preloader, Reveals, Ensō-Zeichnung, Parallax, horizontaler
Drop-Scroll). Beide sind reine `useEffect`-Manipulationen am DOM ohne
Animationsbibliothek und respektieren `prefers-reduced-motion`.

Der Ensō zeichnet sich über eine **Conic-Mask** auf dem PNG (`--enso-arc` in
Grad, gesetzt aus dem Scroll-Fortschritt). Start-Winkel und Bogenlänge sind auf
den konkreten Pinselstrich justiert — bei neuem Artwork müssen beide neu
eingestellt werden (`.enso-brush` in `globals.css`, `FULL_ARC` in `HomeFx.tsx`).

## Bilder
Upload über `/api/admin/upload` → `storage.ts` → Supabase-Bucket `product-images`
(public/CDN) bzw. lokal `public/uploads`. **Der Client verkleinert vor dem Upload**
auf max. 1600 px JPEG (`ImageUploader.tsx`) — Originale von 20–30 MB scheitern
sonst am 4.5-MB-Request-Limit von Vercel.

## Stil
Ein einziges Stylesheet: `src/app/globals.css`, klassisches CSS mit Custom
Properties (`--ink`, `--stone`, `--seal` …). Kein Tailwind, keine CSS-Module.
Deutsche Kommentare und deutsche UI-Texte sind projektüblich.
