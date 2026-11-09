-- ============================================================
--  STEP 1: STOCK FOR LUNA'S SHOP – the Supabase database
-- ============================================================
--  This code was run once in Supabase (SQL Editor → Run)
--  on 9 November 2026. It is kept here to show how the database
--  is built, or to build it again in a new Supabase project.
--  Do NOT run it again in the same project.
--  Then run 02-products.sql.
--  See docs/08-supabase.md.
-- ============================================================

-- 1. The table: one row per print. (Replaced by the products table in 02-products.sql.)
create table public.inventory (
  slug       text primary key,
  stock      integer not null default 0 check (stock >= 0),
  updated_at timestamptz not null default now()
);

-- 2. Fill in the current stock.
insert into public.inventory (slug, stock) values
  ('catsuit', 10), ('greetings-friends', 10), ('protector', 10), ('tiger', 10),
  ('free-as-a-bird', 10), ('flower-pot', 10), ('butterflyman', 10), ('grid-and-weave', 10),
  ('seasons-of-change', 10), ('moon-cats', 10), ('flower-friends', 10), ('red-cat', 10),
  ('dont-let-fear', 10), ('night-garden', 10), ('moth', 10), ('high-five', 10),
  ('sun-hug', 10), ('fire-horse', 10), ('spotted-cat', 10), ('cat-and-bunny', 10),
  ('all-in', 10), ('resting-dog', 10), ('purple-flowers', 10), ('big-hug', 10);

-- 3. Security: turn on Row Level Security and only allow READING for visitors.
--    Nobody outside the server can change the stock.
alter table public.inventory enable row level security;

create policy "Alla får läsa lagret" -- Swedish name, means "Everyone may read the stock"
  on public.inventory for select
  to anon, authenticated
  using (true);

-- 4. Remember which orders have already been counted, so the same order is
--    never counted twice (Stripe sometimes sends the same message again).
create table public.processed_orders (
  stripe_session_id text primary key,
  created_at        timestamptz not null default now()
);
alter table public.processed_orders enable row level security;
-- (No rules = no visitor can reach it. Only the server.)

-- 5. The function that lowers the stock after a purchase.
--    Everything happens in one step, so two purchases at once can't clash.
--    items looks like this: [{"slug": "catsuit", "quantity": 2}, ...]
create or replace function public.process_order(session_id text, items jsonb)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  item jsonb;
begin
  -- Already counted? Do nothing.
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

-- Only the server (with the secret key) may run the function.
revoke execute on function public.process_order(text, jsonb) from public, anon, authenticated;
