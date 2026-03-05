/*
  # Enable Mollie Card Payments
  
  1. Changes
    - Update card payment method to use Mollie instead of pays.cz
    - Activate card payment method
    - Update gateway configuration for Mollie
  
  2. Notes
    - Card payments will now go through Mollie
    - The gateway_config is updated to reflect Mollie integration
*/

-- Update card payment method to use Mollie
UPDATE payment_methods
SET 
  name_cs = 'Platba kartou (Mollie)',
  description_cs = 'Zaplaťte bezpečně online platební kartou přes Mollie.',
  is_active = true,
  gateway_config = jsonb_build_object(
    'gateway', 'mollie',
    'environment', 'live'
  )
WHERE code = 'card';

-- If card payment method doesn't exist, create it
INSERT INTO payment_methods (
  code,
  name_cs,
  description_cs,
  method_type,
  is_active,
  requires_online_payment,
  adds_fee,
  gateway_config,
  sort_order
) VALUES (
  'card',
  'Platba kartou (Mollie)',
  'Zaplaťte bezpečně online platební kartou přes Mollie.',
  'gateway',
  true,
  true,
  false,
  jsonb_build_object(
    'gateway', 'mollie',
    'environment', 'live'
  ),
  3
) ON CONFLICT (code) DO UPDATE SET
  name_cs = EXCLUDED.name_cs,
  description_cs = EXCLUDED.description_cs,
  is_active = EXCLUDED.is_active,
  gateway_config = EXCLUDED.gateway_config;
