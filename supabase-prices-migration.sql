-- Run this in Supabase SQL Editor to add multi-currency pricing
-- Dashboard > SQL Editor > New Query > Paste this > Run

-- Add prices column (JSONB) to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS prices JSONB DEFAULT '{"USD": 0, "EUR": 0, "EGP": 0, "SAR": 0}';

-- Copy existing price values into the USD field of prices
UPDATE products SET prices = jsonb_build_object(
  'USD', COALESCE(price, 0),
  'EUR', 0,
  'EGP', 0,
  'SAR', 0
) WHERE prices IS NULL OR prices = '{"USD": 0, "EUR": 0, "EGP": 0, "SAR": 0}'::jsonb;
