-- 1. Create a new storage bucket called 'branding'
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true);

-- 2. Allow public access to view the uploaded files (so Resend emails can show them)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'branding' );

-- 3. Allow authenticated or anon users to upload files
-- If your app allows anon users to upload files in checkout:
create policy "Anon/Auth Upload"
  on storage.objects for insert
  with check ( bucket_id = 'branding' );
