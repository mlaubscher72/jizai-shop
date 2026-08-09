-- JIZAI Shop — 2FA aktivieren
-- Einmalig im Supabase SQL-Editor ausführen:
--   Dashboard → SQL Editor → New query → einfügen → Run

alter table admin_users add column if not exists totp_secret text;
