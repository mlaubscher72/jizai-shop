# JIZAI Shop auf Hostinger deployen (VPS)

Der Shop braucht einen Node.js-Server — auf Hostinger heisst das: **VPS**
(klassisches Shared-Webhosting kann kein Node). Einmal eingerichtet, ist jedes
weitere Deployment ein einziger Befehl.

---

## 1. VPS bestellen (einmalig, ~10 Min)

1. hostinger.com → **VPS** → kleinster Plan reicht (KVM 1: 1 vCPU / 4 GB RAM)
2. Als Betriebssystem-Template **"Ubuntu 24.04 with Docker"** wählen
   (unter "OS mit Panel/Apps" — spart die Docker-Installation)
3. Beim Setup deinen **SSH-Key** hinterlegen (hPanel → VPS → Settings → SSH Keys).
   Noch kein Key? Auf dem Mac: `ssh-keygen -t ed25519` → Inhalt von `~/.ssh/id_ed25519.pub` einfügen.
4. VPS-IP notieren (z. B. `185.xx.xx.xx`)

## 2. Domain auf den VPS zeigen (hPanel → Domains → DNS)

| Typ | Name | Wert          |
|-----|------|---------------|
| A   | @    | 185.xx.xx.xx  |
| A   | www  | 185.xx.xx.xx  |

(Propagation dauert meist nur Minuten, kann aber bis zu 1–2 h gehen.)

## 3. Produktions-Umgebung anlegen

Auf dem VPS (`ssh root@185.xx.xx.xx`):

```bash
mkdir -p /opt/jizai-shop
nano /opt/jizai-shop/.env.production
```

Inhalt (Werte anpassen!):

```env
# Admin — UNBEDINGT eigene Werte setzen
ADMIN_PASSWORD=langes-eigenes-passwort
ADMIN_SESSION_SECRET=zufaelliger-string-mindestens-32-zeichen

# Supabase (für Produktion empfohlen — siehe README Schritt 1)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (ohne diese Zeilen: Demo-Checkout)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_BASE_URL=https://jizai.ch
```

> Ohne Supabase-Keys läuft der Shop auch auf dem VPS im Demo-Modus —
> die Daten bleiben dank Docker-Volume erhalten, aber für den echten
> Verkauf ist Supabase Pflicht (Backups!).

## 4. Erstes Deployment (vom Mac aus)

```bash
cd ~/Claude/Projects/jizai-shop
chmod +x deploy/deploy.sh
./deploy/deploy.sh root@185.xx.xx.xx
```

Das Script synct den Code nach `/opt/jizai-shop`, baut das Docker-Image
auf dem Server und startet den Container (Port 3000, nur lokal erreichbar).

## 5. Nginx + SSL (einmalig)

Auf dem VPS:

```bash
apt update && apt install -y nginx certbot python3-certbot-nginx
cp /opt/jizai-shop/deploy/nginx-jizai.conf /etc/nginx/sites-available/jizai
nano /etc/nginx/sites-available/jizai        # Domain anpassen, falls nicht jizai.ch
ln -s /etc/nginx/sites-available/jizai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
certbot --nginx -d jizai.ch -d www.jizai.ch  # holt & erneuert SSL automatisch
```

Fertig: **https://jizai.ch** läuft. 🎌

## 6. Stripe-Webhook auf die Live-Domain zeigen

Stripe-Dashboard → Developers → Webhooks → Endpoint:
`https://jizai.ch/api/stripe-webhook` (Events: `checkout.session.completed`,
`checkout.session.expired`) — das Signing-Secret in `.env.production`
eintragen und einmal neu deployen.

---

## Updates deployen

```bash
./deploy/deploy.sh root@185.xx.xx.xx
```

## Nützliche Befehle auf dem VPS

```bash
docker logs -f jizai-shop          # Live-Logs
docker compose restart             # Neustart (im /opt/jizai-shop)
docker compose up -d --build       # Neu bauen nach .env-Änderung
```
