-- Add missing columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0;

-- Note: After running this, go to Supabase Dashboard -> Project Settings -> API 
-- and click "Reload schema cache" if you still get schema cache errors.
