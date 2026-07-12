#!/usr/bin/env bash
# ── JIZAI Shop → Hostinger VPS ───────────────────────────────
# Einmalig:  SSH-Key auf dem VPS hinterlegen, dann:
#   ./deploy/deploy.sh root@DEINE-VPS-IP
# Synct den Code, baut das Docker-Image auf dem Server und startet neu.

set -euo pipefail

TARGET="${1:?Usage: ./deploy/deploy.sh user@host}"
REMOTE_DIR="/opt/jizai-shop"

echo "→ Code synchronisieren nach $TARGET:$REMOTE_DIR"
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude data --exclude .git \
  --exclude ".env*" \
  ./ "$TARGET:$REMOTE_DIR/"

echo "→ Container neu bauen & starten"
ssh "$TARGET" "cd $REMOTE_DIR \
  && test -f .env.production || { echo 'FEHLT: $REMOTE_DIR/.env.production — siehe deploy/DEPLOY-HOSTINGER.md'; exit 1; } \
  && docker compose up -d --build \
  && docker image prune -f"

echo "✓ Deployment fertig — prüfe https://deine-domain"
