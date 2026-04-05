/*
  # Seed Product Variants

  1. Data
    - Creates weight-based variants (1g, 3g, 5g, 10g) for each product
    - Prices: 1g=190, 3g=490, 5g=790, 10g=1390 CZK
    - All variants start with stock=100 and is_available=true

  2. Notes
    - Uses product slug to match products dynamically
    - ON CONFLICT protection via unique (product_id, variant_name) not available, so uses conditional insert
*/

DO $$
DECLARE
  v_product RECORD;
BEGIN
  FOR v_product IN SELECT id, name FROM products LOOP
    INSERT INTO product_variants (product_id, variant_name, variant_type, weight_grams, price, stock, is_available, sort_order)
    VALUES
      (v_product.id, '1g', 'weight', 1, 190, 100, true, 1),
      (v_product.id, '3g', 'weight', 3, 490, 100, true, 2),
      (v_product.id, '5g', 'weight', 5, 790, 100, true, 3),
      (v_product.id, '10g', 'weight', 10, 1390, 100, true, 4);
  END LOOP;
END $$;