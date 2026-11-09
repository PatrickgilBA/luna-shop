-- ============================================================
--  STEP 3: ADMINS
-- ============================================================
--  Run once in Supabase (SQL Editor → Run), after 02-products.sql.
--
--  Only accounts listed in the "admins" table may add, change or
--  delete prints. The rule lives in the database itself (Row Level
--  Security), so it holds even if someone manages to create an account.
--  Everything runs in one transaction: if one line fails, nothing changes.
-- ============================================================

begin;

-- 1. The list of admins: one row per Supabase Auth account.
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- A signed-in account may see whether it is on the list (used by the site
-- to decide if the admin page should open). Nobody can add themselves.
create policy "Admins can see themselves"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

-- 2. Is the signed-in account an admin? Used by the rules below.
--    "security definer" lets it read the admins table without opening it to everyone.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 3. Admins may add, change and delete prints. (Everyone can already read them.)
create policy "Admins can add products"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can change products"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- 4. The first admin.
insert into public.admins (user_id)
select id from auth.users where email = 'pgil@itba.edu.ar';

commit;
