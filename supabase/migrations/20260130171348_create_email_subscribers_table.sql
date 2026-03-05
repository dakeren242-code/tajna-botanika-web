/*
  # Create email subscribers table for newsletter and marketing

  1. New Tables
    - `email_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null) - Subscriber email address
      - `discount_code` (text) - Generated discount code for first-time subscribers
      - `source` (text) - Where they subscribed from (welcome_popup, exit_intent, newsletter_box)
      - `is_active` (boolean) - Whether subscription is active
      - `subscribed_at` (timestamptz) - When they subscribed
      - `unsubscribed_at` (timestamptz) - When they unsubscribed (if applicable)
      - `ip_address` (text) - IP for fraud prevention
      
  2. Security
    - Enable RLS on `email_subscribers` table
    - Add policy for service role to manage subscribers
    - Add policy for inserting new subscribers (public)
*/

CREATE TABLE IF NOT EXISTS email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  discount_code text,
  source text NOT NULL DEFAULT 'website',
  is_active boolean DEFAULT true,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  ip_address text,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON email_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can manage all subscribers"
  ON email_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_active ON email_subscribers(is_active) WHERE is_active = true;