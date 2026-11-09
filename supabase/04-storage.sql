-- ============================================================
--  STEP 4: IMAGE UPLOAD (Supabase Storage)
-- ============================================================
--  Run once in Supabase (SQL Editor → Run), after 03-admin.sql.
--
--  Creates a "bucket" (a folder in the cloud) for product images.
--  Everyone can see the images (they are shown in the shop), but
--  only admins can upload or delete them.
--  Everything runs in one transaction: if one line fails, nothing changes.
-- ============================================================

begin;

-- 1. The bucket: public to read, max 5 MB per file, only JPEG, PNG and WebP.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- 2. Only admins may list, upload, replace or delete images in the bucket.
--    (Everyone can still see an image through its public address. Supabase
--    needs the "select" rule too before it lets an admin delete or replace.)
create policy "Admins can list product images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can replace product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

commit;
