-- ============================================================
--  LAGER FÖR LUNAS BUTIK – databasen i Supabase
-- ============================================================
--  Den här koden kördes en gång i Supabase (SQL Editor → Run)
--  den 9 november 2026. Den sparas här så att det går att se
--  hur databasen är uppbyggd, eller bygga upp den igen i ett
--  nytt Supabase-projekt. Kör den INTE igen i samma projekt.
--  Kör sedan 02-products.sql.
--  Läs docs/08-supabase.md.
-- ============================================================

-- 1. Tabellen: en rad per poster. (Ersattes av tabellen products i 02-products.sql.)
create table public.inventory (
  slug       text primary key,
  stock      integer not null default 0 check (stock >= 0),
  updated_at timestamptz not null default now()
);

-- 2. Fyll i nuvarande lager.
insert into public.inventory (slug, stock) values
  ('catsuit', 10), ('greetings-friends', 10), ('protector', 10), ('tiger', 10),
  ('free-as-a-bird', 10), ('flower-pot', 10), ('butterflyman', 10), ('grid-and-weave', 10),
  ('seasons-of-change', 10), ('moon-cats', 10), ('flower-friends', 10), ('red-cat', 10),
  ('dont-let-fear', 10), ('night-garden', 10), ('moth', 10), ('high-five', 10),
  ('sun-hug', 10), ('fire-horse', 10), ('spotted-cat', 10), ('cat-and-bunny', 10),
  ('all-in', 10), ('resting-dog', 10), ('purple-flowers', 10), ('big-hug', 10);

-- 3. Säkerhet: slå på Row Level Security och tillåt bara LÄSNING för besökare.
--    Ingen utanför servern kan ändra lagret.
alter table public.inventory enable row level security;

create policy "Alla får läsa lagret"
  on public.inventory for select
  to anon, authenticated
  using (true);

-- 4. Kom ihåg vilka köp som redan räknats, så att samma köp aldrig
--    räknas två gånger (Stripe kan ibland skicka samma meddelande igen).
create table public.processed_orders (
  stripe_session_id text primary key,
  created_at        timestamptz not null default now()
);
alter table public.processed_orders enable row level security;
-- (Inga regler = ingen besökare kommer åt den. Bara servern.)

-- 5. Funktionen som räknar ner lagret efter ett köp.
--    Allt sker i ett steg, så två samtidiga köp kan inte krocka.
--    items ser ut så här: [{"slug": "catsuit", "quantity": 2}, ...]
create or replace function public.process_order(session_id text, items jsonb)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  item jsonb;
begin
  -- Redan räknat? Gör ingenting.
  insert into processed_orders (stripe_session_id) values (session_id)
  on conflict do nothing;
  if not found then
    return false;
  end if;

  for item in select * from jsonb_array_elements(items) loop
    update inventory
       set stock = greatest(stock - (item->>'quantity')::int, 0),
           updated_at = now()
     where slug = item->>'slug';
  end loop;

  return true;
end;
$$;

-- Bara servern (med den hemliga nyckeln) får köra funktionen.
revoke execute on function public.process_order(text, jsonb) from public, anon, authenticated;
