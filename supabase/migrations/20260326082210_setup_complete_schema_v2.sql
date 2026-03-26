/*
  # Complete E-commerce Schema Setup with Facebook Catalog Support

  1. New Tables
    - products - Main products catalog
    - product_variants - Product size variants
    - orders - Customer orders
    - order_items - Order line items
    - cart_items - Shopping cart
    - payment_methods - Payment options
    - shipping_methods - Shipping options
    - payment_transactions - Payment records
    - email_subscribers - Newsletter list
    - admin_users - Admin permissions

  2. Security
    - RLS enabled on all tables
    - Policies for public and authenticated access

  3. Facebook Integration
    - meta_catalog_id for Facebook Catalog sync
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  image_url text,
  category text,
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  thc_content decimal(5,2),
  cbd_content decimal(5,2),
  effects text[],
  featured boolean DEFAULT false,
  meta_catalog_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_meta_catalog_id ON products(meta_catalog_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
CREATE POLICY "Authenticated users can delete products" ON products FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  sku text UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view product variants" ON product_variants;
CREATE POLICY "Anyone can view product variants" ON product_variants FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view payment methods" ON payment_methods;
CREATE POLICY "Anyone can view payment methods" ON payment_methods FOR SELECT USING (enabled = true);

CREATE TABLE IF NOT EXISTS shipping_methods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  price decimal(10,2) DEFAULT 0,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view shipping methods" ON shipping_methods;
CREATE POLICY "Anyone can view shipping methods" ON shipping_methods FOR SELECT USING (enabled = true);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method_id uuid REFERENCES payment_methods(id),
  shipping_method_id uuid REFERENCES shipping_methods(id),
  total_amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'CZK',
  customer_email text NOT NULL,
  customer_name text,
  customer_phone text,
  shipping_address jsonb NOT NULL,
  billing_address jsonb,
  payment_reference text,
  tracking_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anonymous can view recent guest orders" ON orders;
CREATE POLICY "Anonymous can view recent guest orders" ON orders FOR SELECT TO anon USING (user_id IS NULL AND created_at > now() - interval '24 hours');

DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_variant_id uuid REFERENCES product_variants(id),
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Anonymous can view recent guest order items" ON order_items;
CREATE POLICY "Anonymous can view recent guest order items" ON order_items FOR SELECT TO anon USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id IS NULL
    AND orders.created_at > now() - interval '24 hours'
  )
);

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  product_variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  payment_method_code text NOT NULL,
  transaction_id text,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'CZK',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment transactions" ON payment_transactions;
CREATE POLICY "Users can view own payment transactions" ON payment_transactions FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = payment_transactions.order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE TABLE IF NOT EXISTS email_subscribers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  source text DEFAULT 'website'
);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);

ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON email_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON email_subscribers FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
CREATE POLICY "Admins can view admin users" ON admin_users FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
  )
);

INSERT INTO payment_methods (name, code, description, enabled)
VALUES
  ('Online card payment', 'card', 'Pay securely with your credit or debit card', true),
  ('Bank transfer', 'bank_transfer', 'Direct bank transfer', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO shipping_methods (name, code, description, price, enabled)
VALUES
  ('PPL', 'ppl', 'PPL courier delivery', 99, true),
  ('Zásilkovna', 'packeta', 'Pick up at Zásilkovna point', 49, true),
  ('Czech Post', 'czech_post', 'Standard postal delivery', 79, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO products (name, description, price, image_url, category, stock_quantity, thc_content, cbd_content, effects, featured)
VALUES
  (
    'CBD Oil 10%',
    'Premium quality CBD oil with 10% concentration. Perfect for daily wellness and relaxation.',
    1990,
    'https://images.pexels.com/photos/6667767/pexels-photo-6667767.jpeg',
    'CBD Oils',
    50,
    0.2,
    10.0,
    ARRAY['relaxation', 'wellness', 'sleep'],
    true
  ),
  (
    'CBD Gummies 25mg',
    'Delicious CBD-infused gummies. Each gummy contains 25mg of premium CBD.',
    599,
    'https://images.pexels.com/photos/6667772/pexels-photo-6667772.jpeg',
    'Edibles',
    100,
    0,
    25.0,
    ARRAY['relaxation', 'stress relief'],
    true
  ),
  (
    'Hemp Flower Premium',
    'High-quality hemp flower with natural terpenes and cannabinoids.',
    899,
    'https://images.pexels.com/photos/7257401/pexels-photo-7257401.jpeg',
    'Flowers',
    30,
    0.3,
    15.0,
    ARRAY['relaxation', 'focus'],
    true
  ),
  (
    'CBD Cream 500mg',
    'Topical CBD cream for targeted relief. Contains 500mg of CBD per jar.',
    799,
    'https://images.pexels.com/photos/6663583/pexels-photo-6663583.jpeg',
    'Topicals',
    75,
    0,
    500.0,
    ARRAY['pain relief', 'skin care'],
    false
  ),
  (
    'CBD Oil 20%',
    'Extra strength CBD oil with 20% concentration for advanced users.',
    3490,
    'https://images.pexels.com/photos/7261419/pexels-photo-7261419.jpeg',
    'CBD Oils',
    25,
    0.2,
    20.0,
    ARRAY['relaxation', 'wellness', 'deep sleep'],
    true
  ),
  (
    'Hemp Tea Relax',
    'Organic hemp tea blend designed for relaxation and better sleep.',
    299,
    'https://images.pexels.com/photos/7257435/pexels-photo-7257435.jpeg',
    'Beverages',
    150,
    0,
    5.0,
    ARRAY['relaxation', 'sleep', 'calm'],
    false
  )
ON CONFLICT DO NOTHING;
