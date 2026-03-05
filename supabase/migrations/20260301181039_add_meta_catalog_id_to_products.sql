/*
  # Add meta_catalog_id column to products

  ## Purpose
  Store the exact "ID obsahu" (content item ID) from the Meta product catalog
  for each product. This ID is used as content_ids in all Meta Pixel events
  (ViewContent, AddToCart, ViewCart, InitiateCheckout, Purchase) to achieve
  100% catalog match rate.

  ## Changes
  - `products` table: add nullable text column `meta_catalog_id`
  - Add unique index to prevent duplicate catalog IDs
  - Column is nullable so existing products continue to work without breaking

  ## Notes
  - Fill in values via the Admin dashboard or directly in Supabase after
    looking up each product's "ID obsahu" in Meta Commerce Manager
  - When this column is NULL for a product, tracking code will skip
    content_ids for that product and log a warning in dev mode
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'meta_catalog_id'
  ) THEN
    ALTER TABLE products ADD COLUMN meta_catalog_id text;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS products_meta_catalog_id_unique
  ON products (meta_catalog_id)
  WHERE meta_catalog_id IS NOT NULL;
