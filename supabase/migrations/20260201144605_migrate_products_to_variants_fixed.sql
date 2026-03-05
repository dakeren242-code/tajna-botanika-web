/*
  # Migrate Existing Products to Variants

  1. Create variants for all existing products
    - 1g @ 190 CZK
    - 3g @ 490 CZK
    - 5g @ 690 CZK
    - 10g @ 1290 CZK

  2. Set stock from products table
    - Each variant gets equal share of total stock

  3. Benefits
    - Price history preserved
    - Individual stock tracking per variant
    - Easy price management
*/

-- Create variants for all products
INSERT INTO product_variants (
  product_id,
  variant_name,
  variant_type,
  weight_grams,
  price,
  stock,
  is_available,
  sort_order
)
SELECT
  p.id,
  '1g',
  'weight',
  1,
  190.00,
  GREATEST(COALESCE(p.stock, 0) / 4, 10),  -- At least 10 in stock per variant
  true,
  1
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM product_variants pv
  WHERE pv.product_id = p.id AND pv.variant_name = '1g'
)

UNION ALL

SELECT
  p.id,
  '3g',
  'weight',
  3,
  490.00,
  GREATEST(COALESCE(p.stock, 0) / 4, 10),
  true,
  2
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM product_variants pv
  WHERE pv.product_id = p.id AND pv.variant_name = '3g'
)

UNION ALL

SELECT
  p.id,
  '5g',
  'weight',
  5,
  690.00,
  GREATEST(COALESCE(p.stock, 0) / 4, 10),
  true,
  3
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM product_variants pv
  WHERE pv.product_id = p.id AND pv.variant_name = '5g'
)

UNION ALL

SELECT
  p.id,
  '10g',
  'weight',
  10,
  1290.00,
  GREATEST(COALESCE(p.stock, 0) / 4, 10),
  true,
  4
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM product_variants pv
  WHERE pv.product_id = p.id AND pv.variant_name = '10g'
);
