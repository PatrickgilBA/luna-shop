-- ============================================================
--  STEP 2: PRODUCTS IN SUPABASE
-- ============================================================
--  Run once in Supabase (SQL Editor → Run), after 01-setup.sql.
--  Moves every print (name, price, size, description, images)
--  into a "products" table, together with the stock.
--
--  "inventory" becomes a read-only view of products, so code that
--  still reads "inventory" keeps working during the switch.
--  Everything runs in one transaction: if one line fails, nothing changes.
-- ============================================================

begin;

-- 1. The table: one row per print.
create table public.products (
  slug        text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title       text not null check (length(trim(title)) > 0),
  size        text not null default '',
  price       numeric(10, 2) not null check (price > 0),
  description text not null default '',
  images      text[] not null default '{}',
  stock       integer not null default 0 check (stock >= 0),
  sort_order  integer not null default 0,   -- order in the shop (lowest first)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. The 24 prints that were in data/products.js.
insert into public.products (slug, title, size, price, description, images, sort_order) values
  ('catsuit', 'Catsuit', 'A4 (21 × 29.7 cm)', 30, 'A very cool cat in a very blue suit. Risograph print on thick paper.', array['/images/products/catsuit-1.jpg', '/images/products/catsuit-2.jpg'], 10),
  ('greetings-friends', 'Greetings Friends', 'A3 (29.7 × 42 cm)', 35, 'A crowded shelf of happy house plants. Risograph print.', array['/images/products/greetings-friends-1.jpg', '/images/products/greetings-friends-2.jpg'], 20),
  ('protector', 'Protector', 'A5 (14.8 × 21 cm)', 14, 'A gentle giant keeping someone small safe. Risograph print.', array['/images/products/protector-1.jpg', '/images/products/protector-2.jpg', '/images/products/protector-3.jpg', '/images/products/protector-4.jpg'], 30),
  ('tiger', 'Tiger', '30 × 30 cm', 35, 'A striped tiger hiding among the flowers. Risograph print.', array['/images/products/tiger-1.jpg', '/images/products/tiger-2.jpg'], 40),
  ('free-as-a-bird', 'Free as a Bird', 'A3 (29.7 × 42 cm)', 35, 'A black bird in a wild, colourful jungle. Risograph print.', array['/images/products/free-as-a-bird-1.jpg', '/images/products/free-as-a-bird-2.jpg'], 50),
  ('flower-pot', 'Flower Pot', 'A4 (21 × 29.7 cm)', 30, 'A wobbly blue vase full of spring flowers. Risograph print.', array['/images/products/flower-pot-1.jpg', '/images/products/flower-pot-2.jpg', '/images/products/flower-pot-3.jpg'], 60),
  ('butterflyman', 'Butterflyman', 'A4 (21 × 29.7 cm)', 30, 'Half human, half butterfly. Risograph print.', array['/images/products/butterflyman-1.jpg', '/images/products/butterflyman-2.jpg'], 70),
  ('grid-and-weave', 'Grid and Weave', 'A3 (29.7 × 42 cm)', 35, 'Four colours woven together. Risograph print.', array['/images/products/grid-and-weave-1.jpg', '/images/products/grid-and-weave-2.jpg'], 80),
  ('seasons-of-change', 'Seasons of Change', 'A4 (21 × 29.7 cm)', 30, 'A spotted creature with a flower on its back. Risograph print.', array['/images/products/seasons-of-change-1.jpg', '/images/products/seasons-of-change-2.jpg'], 90),
  ('moon-cats', 'Moon Cats', 'A4 (21 × 29.7 cm)', 30, 'Two cats cuddling under the moon. Risograph print.', array['/images/products/moon-cats-1.jpg'], 100),
  ('flower-friends', 'Flower Friends', 'A4 (21 × 29.7 cm)', 30, 'Three friends with flowers for heads. Risograph print.', array['/images/products/flower-friends-1.jpg'], 110),
  ('red-cat', 'Red Cat', 'A4 (21 × 29.7 cm)', 30, 'A fluorescent red cat lounging on a branch. Risograph print.', array['/images/products/red-cat-1.jpg'], 120),
  ('dont-let-fear', 'Don''t Let Fear Control Your Body', 'A4 (21 × 29.7 cm)', 30, 'Friendly monsters with an important message. Risograph print.', array['/images/products/dont-let-fear-1.jpg'], 130),
  ('night-garden', 'Night Garden', 'A4 (21 × 29.7 cm)', 30, 'A tiny figure in a garden glowing in the dark. Risograph print.', array['/images/products/night-garden-1.jpg'], 140),
  ('moth', 'Moth', 'A4 (21 × 29.7 cm)', 30, 'An orange moth flying through the clouds. Risograph print.', array['/images/products/moth-1.jpg'], 150),
  ('high-five', 'High Five', 'A5 (14.8 × 21 cm)', 14, 'A cat and a leopard sharing a sunny high five. Risograph print.', array['/images/products/high-five-1.jpg'], 160),
  ('sun-hug', 'Sun Hug', 'A5 (14.8 × 21 cm)', 14, 'Night embracing the sun. Risograph print.', array['/images/products/sun-hug-1.jpg'], 170),
  ('fire-horse', 'Fire Horse', 'A5 (14.8 × 21 cm)', 14, 'A golden horse galloping through flames. Risograph print.', array['/images/products/fire-horse-1.jpg'], 180),
  ('spotted-cat', 'Spotted Cat', 'A5 (14.8 × 21 cm)', 14, 'A polka-dot cat on a deep green background. Risograph print.', array['/images/products/spotted-cat-1.jpg'], 190),
  ('cat-and-bunny', 'Cat and Bunny', 'A5 (14.8 × 21 cm)', 14, 'Best friends out for a walk. Risograph print.', array['/images/products/cat-and-bunny-1.jpg'], 200),
  ('all-in', 'All In!', 'A5 (14.8 × 21 cm)', 14, 'Cheers to going all in. Risograph print.', array['/images/products/all-in-1.jpg'], 210),
  ('resting-dog', 'Resting Dog', 'A5 (14.8 × 21 cm)', 14, 'A white dog taking a well-deserved rest. Risograph print.', array['/images/products/resting-dog-1.jpg'], 220),
  ('purple-flowers', 'Purple Flowers', '15 × 15 cm', 14, 'Lilac blooms on a dark background. Risograph print.', array['/images/products/purple-flowers-1.jpg'], 230),
  ('big-hug', 'Big Hug', 'A5 (14.8 × 21 cm)', 14, 'Two flower people in a warm embrace. Risograph print.', array['/images/products/big-hug-1.jpg'], 240);

-- 3. Keep the current stock.
update public.products p
   set stock = i.stock
  from public.inventory i
 where i.slug = p.slug;

-- 4. Security: everyone may READ products. Nobody may change them through the
--    public key. (Admin rules are added in a later step.)
alter table public.products enable row level security;

create policy "Everyone can read products"
  on public.products for select
  to anon, authenticated
  using (true);

-- 5. "inventory" becomes a view of products (slug + stock), read with the
--    visitor's own permissions (security_invoker).
drop table public.inventory;
create view public.inventory with (security_invoker = true) as
  select slug, stock, updated_at from public.products;
grant select on public.inventory to anon, authenticated;

-- 6. Lowering the stock after a purchase now updates products.
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
    update products
       set stock = greatest(stock - (item->>'quantity')::int, 0),
           updated_at = now()
     where slug = item->>'slug';
  end loop;

  return true;
end;
$$;

-- Only the server (with the secret key) may run the function.
revoke execute on function public.process_order(text, jsonb) from public, anon, authenticated;

commit;
