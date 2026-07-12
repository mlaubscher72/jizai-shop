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

-- Seed: Drop 01
insert into products (id, slug, name, subtitle, kanji, accent, price_rappen, description, story, image, active) values
  ('p_koi',  'koi',   'KOI',   'Circling',  '鯉', '#8C2F24', 7500, 'Zwei Koi, eine Bewegung. Rote Tusche auf Soft Stone.', 'Zwei Koi umkreisen einander in einer einzigen Geste — gezogen wie ein Atemzug, nie geschlossen.', '/assets/tee-koi.jpg', true),
  ('p_tsuru','tsuru', 'TSURU', 'Rising',    '鶴', '#2E4E8F', 7500, 'Der Kranich im Aufstieg. Indigo auf Charcoal Ink.', 'Der Kranich steigt — ohne Eile, ohne Lärm. Indigo auf Charcoal Black, inspiriert von Aizome.', '/assets/tee-crane.jpg', true),
  ('p_furin','furin', 'FŪRIN', 'Listening', '鈴', '#4E6B3A', 7500, 'Die Windglocke. Klang, bevor der Lärm beginnt.', 'Die Fūrin-Windglocke hängt still, bis der Wind sie findet.', '/assets/tee-bell.jpg', true),
  ('p_take', 'take',  'TAKE',  'Bending',   '竹', '#5E7285', 7500, 'Bambus: biegsam, nie gebrochen. Stille Stärke.', 'Bambus biegt sich im Sturm und bricht nicht — die älteste Lektion des Budo.', '/assets/tee-bamboo.jpg', true)
on conflict (id) do nothing;

insert into product_variants (product_id, size, stock)
select p.id, s.size, case when s.size in ('M','L') then 30 else 20 end
from products p, (values ('S'),('M'),('L'),('XL')) as s(size)
on conflict do nothing;
