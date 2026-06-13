-- Migration: Add discount_percentage to products table

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0;
