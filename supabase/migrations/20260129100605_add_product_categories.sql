/*
  # Add Product Categories

  1. Changes
    - Add `category` column to products table
    - Possible values: 'relaxing', 'energizing', 'balanced'
    - Set categories for existing products based on strain types
  
  2. Category Mapping (based on Leafly strain data)
    - Relaxing: Indica-dominant strains (Bubble Gum, Forbidden Fruit, Wedding Cake)
    - Energizing: Sativa-dominant strains (Amnesia, Pineapple Zkittlez, Lemon Cherry Gelato)
    - Balanced: Hybrid strains (Gelato, Golden Nugget)
*/

-- Add category column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category'
  ) THEN
    ALTER TABLE products ADD COLUMN category TEXT;
  END IF;
END $$;

-- Set categories based on strain characteristics
UPDATE products SET category = 'energizing' WHERE name LIKE '%Amnesia%';
UPDATE products SET category = 'relaxing' WHERE name LIKE '%Bubble Gum%';
UPDATE products SET category = 'relaxing' WHERE name LIKE '%Forbidden Fruit%';
UPDATE products SET category = 'balanced' WHERE name LIKE '%Gelato%' AND name NOT LIKE '%Lemon Cherry Gelato%';
UPDATE products SET category = 'balanced' WHERE name LIKE '%Golden Nugget%';
UPDATE products SET category = 'energizing' WHERE name LIKE '%Lemon Cherry Gelato%';
UPDATE products SET category = 'energizing' WHERE name LIKE '%Pineapple Zkittlez%';
UPDATE products SET category = 'relaxing' WHERE name LIKE '%Wedding Cake%';

-- Set default for any products without category
UPDATE products SET category = 'balanced' WHERE category IS NULL;
