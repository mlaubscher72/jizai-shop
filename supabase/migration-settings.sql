-- JIZAI Shop — Einstellungen (z. B. Coming-Soon-Modus)
-- Einmalig im Supabase SQL-Editor ausführen:
--   https://supabase.com/dashboard/project/pkqnyeonuzittsqtworu/sql/new

create table if not exists settings (
  key text primary key,
  value text not null
);
alter table settings enable row level security;
