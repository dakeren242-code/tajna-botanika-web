/*
  # THC-X Flower Products Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text) - Product name
      - `slug` (text, unique) - URL-friendly identifier
      - `description` (text) - Product description
      - `price` (decimal) - Product price
      - `thc_content` (text) - THC percentage
      - `cbd_content` (text) - CBD percentage
      - `strain_type` (text) - Indica/Sativa/Hybrid
      - `flavor_profile` (text) - Flavor notes
      - `effects` (text) - Product effects
      - `color_accent` (text) - Hex color for product theme
      - `glow_color` (text) - Hex color for glow effect
      - `image_url` (text) - Product image URL
      - `featured` (boolean) - Featured product flag
      - `stock` (integer) - Available stock
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `products` table
    - Add policy for public read access (e-commerce site)
    - Add policy for authenticated admin updates
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  thc_content text DEFAULT '',
  cbd_content text DEFAULT '',
  strain_type text DEFAULT '',
  flavor_profile text DEFAULT '',
  effects text DEFAULT '',
  color_accent text DEFAULT '#FFD700',
  glow_color text DEFAULT '#FFD700',
  image_url text DEFAULT '',
  featured boolean DEFAULT false,
  stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
