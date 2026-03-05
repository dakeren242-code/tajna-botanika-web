/*
  # Add Bundle Product Fields

  1. New Columns
    - `original_price` (numeric) - Original price before discount for displaying savings
    - `is_popular` (boolean) - Mark product as popular/best seller (shows badge)
    - `is_subscription` (boolean) - Mark product as subscription-based
    - `subscription_period` (text) - Subscription period (e.g., 'week', 'month')
    - `discount_percentage` (integer) - Calculated discount percentage for display

  2. Purpose
    - Enable bundle products with visible discounts
    - Show "Nejoblíbenější" badge on popular products
    - Support subscription-based products
    - Display clear savings to customers

  3. Security
    - Columns added to existing products table
    - Default values ensure backward compatibility
*/

-- Add original_price column for showing discounts
ALTER TABLE products
ADD COLUMN IF NOT EXISTS original_price numeric DEFAULT NULL;

-- Add is_popular flag for "Nejoblíbenější" badge
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false;

-- Add subscription fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_subscription boolean DEFAULT false;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS subscription_period text DEFAULT NULL;

-- Add discount_percentage for easier display
ALTER TABLE products
ADD COLUMN IF NOT EXISTS discount_percentage integer DEFAULT NULL;

-- Create index for faster queries on popular products
CREATE INDEX IF NOT EXISTS idx_products_popular ON products(is_popular) WHERE is_popular = true;

-- Create index for faster queries on subscriptions
CREATE INDEX IF NOT EXISTS idx_products_subscription ON products(is_subscription) WHERE is_subscription = true;
