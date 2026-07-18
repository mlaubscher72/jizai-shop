-- JIZAI Shop — Supabase-Schema
-- Im Supabase SQL-Editor ausführen, dann Seed unten anpassen/ausführen.

create table if not exists products (
  id text primary key,
  slug text unique not null,
  name text not null,
  subtitle text not null default '',
  kanji text not null default '',
  accent text not null default '#8C2F24',
  price_rappen integer not null,
  description text not null default '',
  story text not null default '',
  image text not null default '',
  active boolean not null default true
);

create table if not exists product_variants (
  product_id text not null references products(id) on delete cascade,
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  primary key (product_id, size)
);

create table if not exists orders (
  id text primary key,
  email text not null,
  name text not null,
  street text not null default '',
  zip text not null default '',
  city text not null default '',
  country text not null default 'CH',
  items jsonb not null,
  total_rappen integer not null,
  status text not null default 'pending' check (status in ('pending','paid','shipped','cancelled')),
  stripe_session_id text,
  created_at timestamptz not null default now()
);

create table if not exists waitlist (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists admin_users (
  id text primary key,
  email text unique not null,
  name text not null default '',
  role text not null default 'viewer' check (role in ('admin','manager','viewer')),
  password_hash text not null,
  created_at timestamptz not null default now()
);
alter table admin_users enable row level security;

-- Atomare Bestandsreservierung (alles oder nichts)
create or replace function reserve_stock(items jsonb)
returns void language plpgsql as $$
declare
  item jsonb;
  updated integer;
begin
  for item in select * from jsonb_array_elements(items) loop
    update product_variants
      set stock = stock - (item->>'qty')::int
      where product_id = item->>'productId'
        and size = item->>'size'
        and stock >= (item->>'qty')::int;
    get diagnostics updated = row_count;
    if updated = 0 then
      raise exception 'Nicht genug Bestand für % (%)', item->>'productId', item->>'size';
    end if;
  end loop;
end $$;

create or replace function restore_stock(items jsonb)
returns void language plpgsql as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(items) loop
    update product_variants
      set stock = stock + (item->>'qty')::int
      where product_id = item->>'productId'
        and size = item->>'size';
  end loop;
end $$;

-- RLS: Tabellen sperren — Zugriff nur über Service-Role-Key (Server)
alter table products enable row level security;
alter table product_variants enable row level security;
alter table orders enable row level security;
alter table waitlist enable row level security;

-- Seed: Drop 01 · 守破 SHU × HA
-- Akt-Logik: kanji-Feld = Akt. 守 (SHU) = bestellbar, 破 (HA) = sichtbar, noch nicht bestellbar.
-- Preise: TEE_CORE 79 / TEE_HERO 89 / HOODIE 139 (siehe src/lib/seed.ts)
insert into products (id, slug, name, subtitle, kanji, accent, price_rappen, description, story, image, active) values
  ('p_core_tee',    'core-tee',    'JIZAI CORE TEE',    'Oversized Heavyweight Tee · 280 GSM', '守', '#9A958B', 7900,  'Der gebrochene Ensō. Kleine Frontmarke, maximaler Negativraum. Das leiseste Stück der Serie.', 'Der gebrochene Ensō. Kleine Frontmarke, maximaler Negativraum. Das leiseste Stück der Serie.', '/assets/tee-core.jpg', true),
  ('p_form_tee',    'form-tee',    'JIZAI FORM TEE',    'Oversized Heavyweight Tee · 280 GSM', '守', '#C8B79A', 8900,  'Die gehaltene Form: Meditation im gebrochenen Ensō, Tusche auf Soft Stone. Energie, enthalten — nicht entladen.', 'Die gehaltene Form: Meditation im gebrochenen Ensō, Tusche auf Soft Stone. Energie, enthalten — nicht entladen.', '/assets/tee-form.jpg', true),
  ('p_still_hoodie','still-hoodie','JIZAI STILL HOODIE','Heavyweight Hoodie · 450 GSM',        '守', '#8C2F24', 13900, 'Schwerer Hoodie, gebrochener Ensō als Backprint. Ruhe, die man trägt.', 'Schwerer Hoodie, gebrochener Ensō als Backprint. Ruhe, die man trägt.', '/assets/hoodie-still.jpg', true),
  ('p_break_tee',   'break-tee',   'JIZAI BREAK TEE',   'Oversized Heavyweight Tee · 280 GSM', '破', '#2E4E8F', 8900,  'Zwei Koi, ein Kreis aus Bewegung — vom JIZAI Cut präzise durchtrennt. Form wird gebrochen, nicht zerstört. Indigo auf Soft Stone.', 'Zwei Koi, ein Kreis aus Bewegung — vom JIZAI Cut präzise durchtrennt. Form wird gebrochen, nicht zerstört. Indigo auf Soft Stone.', '/assets/tee-break.jpg', true),
  ('p_motion_tee',  'motion-tee',  'JIZAI MOTION TEE',  'Oversized Heavyweight Tee · 280 GSM', '破', '#5E7285', 8900,  'Die Figur im Impuls: Tusche in Bewegung, der Strich als Kraft. Der Moment, in dem die Form aufbricht.', 'Die Figur im Impuls: Tusche in Bewegung, der Strich als Kraft. Der Moment, in dem die Form aufbricht.', '/assets/tee-motion.jpg', true),
  ('p_break_hoodie','break-hoodie','JIZAI BREAK HOODIE','Heavyweight Hoodie · 450 GSM',        '破', '#8C2F24', 13900, 'Der durchtrennte Kreis als Backprint auf schwerem Stoff. Präzision statt Lärm.', 'Der durchtrennte Kreis als Backprint auf schwerem Stoff. Präzision statt Lärm.', '/assets/hoodie-break.jpg', true)
on conflict (id) do nothing;

insert into product_variants (product_id, size, stock)
select p.id, s.size,
  case when p.subtitle like '%Hoodie%'
       then (case when s.size in ('M','L') then 15 else 10 end)
       else (case when s.size in ('M','L') then 30 else 20 end) end
from products p, (values ('S'),('M'),('L'),('XL')) as s(size)
on conflict do nothing;
