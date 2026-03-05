/*
  # Add cannabinoid values to products

  1. Changes
    - Add THC-X percentage column
    - Add THC percentage column
    - Add CBD percentage column
    - Add CBG percentage column
    - Remove strain_type column (no longer needed)
  
  2. Notes
    - All cannabinoid values are stored as numeric decimals
    - Values represent percentages (e.g., 40.00 = 40%)
*/

-- Add cannabinoid columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS thcx_content numeric(5,2),
ADD COLUMN IF NOT EXISTS thc_percentage numeric(5,2),
ADD COLUMN IF NOT EXISTS cbd_percentage numeric(5,2),
ADD COLUMN IF NOT EXISTS cbg_percentage numeric(5,2);

-- Remove strain_type column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'strain_type'
  ) THEN
    ALTER TABLE products DROP COLUMN strain_type;
  END IF;
END $$;