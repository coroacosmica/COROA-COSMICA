-- Migration: Add multiple images support to the products table

-- 1. Add the "images" column to the "products" table if it doesn't already exist.
-- It uses JSONB to safely store an array of image URL strings.
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- 2. Migrate existing "image" data into the new "images" array.
-- This ensures that products that already have an "image" will have it as the first item in "images".
UPDATE public.products 
SET images = jsonb_build_array(image)
WHERE image IS NOT NULL 
  AND image != '' 
  AND jsonb_array_length(images) = 0;
