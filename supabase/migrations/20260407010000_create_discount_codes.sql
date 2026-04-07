-- Create discount_codes table for registration rewards
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL DEFAULT 15,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ,
  used_order_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days')
);

-- RLS policies
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Users can read their own codes
CREATE POLICY "Users can read own codes" ON public.discount_codes
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can validate a code (for checkout)
CREATE POLICY "Anyone can validate codes" ON public.discount_codes
  FOR SELECT USING (true);

-- Service role can insert/update (via edge function or direct)
CREATE POLICY "Authenticated users can insert own codes" ON public.discount_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can mark their own code as used
CREATE POLICY "Users can update own codes" ON public.discount_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for fast lookup
CREATE INDEX idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX idx_discount_codes_user_id ON public.discount_codes(user_id);
