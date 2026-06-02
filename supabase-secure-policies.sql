-- Run this in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste this > Run

-- 1. Remove the old insecure public policies
DROP POLICY IF EXISTS "Products can be inserted by anyone." ON products;
DROP POLICY IF EXISTS "Products can be updated by anyone." ON products;
DROP POLICY IF EXISTS "Products can be deleted." ON products;
DROP POLICY IF EXISTS "Quote requests are viewable." ON quote_requests;
DROP POLICY IF EXISTS "Quote requests can be updated." ON quote_requests;
DROP POLICY IF EXISTS "Quote requests can be deleted." ON quote_requests;
DROP POLICY IF EXISTS "Allow upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow update product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete product images" ON storage.objects;

-- 2. Create SECURE authenticated-only policies for Products
CREATE POLICY "Products can be inserted by authenticated admins" 
ON products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Products can be updated by authenticated admins" 
ON products FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Products can be deleted by authenticated admins" 
ON products FOR DELETE TO authenticated USING (true);

-- 3. Create SECURE authenticated-only policies for Quote Requests
CREATE POLICY "Quote requests are viewable by authenticated admins" 
ON quote_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Quote requests can be updated by authenticated admins" 
ON quote_requests FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Quote requests can be deleted by authenticated admins" 
ON quote_requests FOR DELETE TO authenticated USING (true);

-- 4. Create SECURE authenticated-only policies for Storage (Image Uploads)
CREATE POLICY "Allow authenticated admins to upload images"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated admins to update images"
ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated admins to delete images"
ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- Note: 
-- "Products are viewable by everyone" remains public (so visitors can see products)
-- "Anyone can insert quote requests" remains public (so visitors can send requests)
-- "Public can view product images" remains public (so images load on the site)
