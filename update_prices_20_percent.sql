-- Update all product prices by +20% in Supabase
-- Can be executed in the Supabase Dashboard SQL Editor

UPDATE products
SET 
  price = ROUND((price * 1.20)::numeric, 2),
  prices = jsonb_build_object(
    'EGP', ROUND(((COALESCE((prices->>'EGP')::numeric, price * 1.10)) * 1.20)::numeric, 2),
    'EUR', ROUND(((COALESCE((prices->>'EUR')::numeric, price * 0.03)) * 1.20)::numeric, 2),
    'USD', ROUND(((((COALESCE((prices->>'EUR')::numeric, price * 0.03)) * 1.20) / 0.92)::numeric), 2)
  )
WHERE price > 0 OR (prices->>'EGP')::numeric > 0 OR (prices->>'EUR')::numeric > 0;
