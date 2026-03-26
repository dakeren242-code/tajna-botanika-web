/*
  # Add missing product columns

  1. Changes
    - Add columns that are being used in the admin form but missing in the database
    - Add thc_percent, cbd_percent, cbg_percent, thc_x_percent
    - Add flavor_profile, gram_options fields
    - Add stock column (separate from stock_quantity)
  
  2. Notes
    - Using IF NOT EXISTS to prevent errors if columns already exist
    - Setting appropriate data types and defaults
*/

-- Add cannabinoid percentage columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'thc_percent'
  ) THEN
    ALTER TABLE products ADD COLUMN thc_percent numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'cbd_percent'
  ) THEN
    ALTER TABLE products ADD COLUMN cbd_percent numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'cbg_percent'
  ) THEN
    ALTER TABLE products ADD COLUMN cbg_percent numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'thc_x_percent'
  ) THEN
    ALTER TABLE products ADD COLUMN thc_x_percent numeric DEFAULT 0;
  END IF;
END $$;

-- Add flavor profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'flavor_profile'
  ) THEN
    ALTER TABLE products ADD COLUMN flavor_profile text;
  END IF;
END $$;

-- Add gram options
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'gram_options'
  ) THEN
    ALTER TABLE products ADD COLUMN gram_options integer[] DEFAULT ARRAY[1, 3, 5, 10];
  END IF;
END $$;

-- Add stock column (used in admin form, separate from stock_quantity)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock'
  ) THEN
    ALTER TABLE products ADD COLUMN stock integer DEFAULT 0;
  END IF;
END $$;
