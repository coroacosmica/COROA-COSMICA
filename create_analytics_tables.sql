-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL,
  session_id text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for page_views
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (tracking from frontend)
CREATE POLICY "Allow anonymous inserts to page_views"
  ON page_views FOR INSERT TO anon
  WITH CHECK (true);

-- Allow authenticated admins to read page_views
CREATE POLICY "Allow admins to read page_views"
  ON page_views FOR SELECT TO authenticated
  USING (true);


-- Create product_views table
CREATE TABLE IF NOT EXISTS product_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_code text NOT NULL,
  session_id text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for product_views
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (tracking from frontend)
CREATE POLICY "Allow anonymous inserts to product_views"
  ON product_views FOR INSERT TO anon
  WITH CHECK (true);

-- Allow authenticated admins to read product_views
CREATE POLICY "Allow admins to read product_views"
  ON product_views FOR SELECT TO authenticated
  USING (true);
