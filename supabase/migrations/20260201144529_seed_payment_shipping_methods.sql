/*
  # Seed Payment and Shipping Methods

  1. Payment Methods
    - Bank Transfer (ACTIVE)
    - Cash on Delivery (ACTIVE)
    - Card via pays.cz (INACTIVE - ready for activation)

  2. Shipping Methods
    - Zásilkovna/Packeta (ACTIVE)
    - Personal Pickup - Prague (ACTIVE)
    - Personal Pickup - Invoice (ACTIVE)
*/

-- =============================================================================
-- PAYMENT METHODS
-- =============================================================================

-- Bank Transfer (ACTIVE)
INSERT INTO payment_methods (
  code,
  name_cs,
  description_cs,
  method_type,
  is_active,
  requires_online_payment,
  adds_fee,
  sort_order
) VALUES (
  'bank_transfer',
  'Bankovní převod',
  'Zaplaťte převodem na náš účet. Po přijetí platby objednávku expedujeme.',
  'manual',
  true,
  false,
  false,
  1
) ON CONFLICT (code) DO UPDATE SET
  name_cs = EXCLUDED.name_cs,
  description_cs = EXCLUDED.description_cs,
  is_active = EXCLUDED.is_active;

-- Cash on Delivery (ACTIVE)
INSERT INTO payment_methods (
  code,
  name_cs,
  description_cs,
  method_type,
  is_active,
  requires_online_payment,
  adds_fee,
  fee_amount,
  sort_order
) VALUES (
  'cash_on_delivery',
  'Dobírka',
  'Zaplaťte při převzetí zásilky. Poplatek za dobírku je 30 Kč.',
  'offline',
  true,
  false,
  true,
  30.00,
  2
) ON CONFLICT (code) DO UPDATE SET
  name_cs = EXCLUDED.name_cs,
  description_cs = EXCLUDED.description_cs,
  is_active = EXCLUDED.is_active,
  fee_amount = EXCLUDED.fee_amount;

-- Card via pays.cz (INACTIVE - ready for activation)
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
  'Platba kartou',
  'Zaplaťte bezpečně online platební kartou.',
  'gateway',
  false,  -- INACTIVE
  true,
  false,
  '{
    "gateway": "pays.cz",
    "environment": "sandbox",
    "api_key": null,
    "merchant_id": null,
    "webhook_secret": null
  }'::jsonb,
  3
) ON CONFLICT (code) DO UPDATE SET
  name_cs = EXCLUDED.name_cs,
  description_cs = EXCLUDED.description_cs;

-- =============================================================================
-- SHIPPING METHODS
-- =============================================================================

-- Zásilkovna/Packeta (ACTIVE)
INSERT INTO shipping_methods (
  code,
  name_cs,
  description_cs,
  carrier_type,
  is_active,
  requires_address,
  requires_packeta_point,
  base_price,
  free_shipping_threshold,
  estimated_days,
  carrier_config,
  sort_order
) VALUES (
  'zasilkovna',
  'Zásilkovna',
  'Vyzvedněte si zásilku na výdejním místě Zásilkovny. Doprava zdarma nad 1000 Kč.',
  'packeta',
  true,
  false,
  true,
  79.00,
  1000.00,
  '1-2 dny',
  '{
    "api_key": null,
    "sender_id": null,
    "environment": "sandbox"
  }'::jsonb,
  1
) ON CONFLICT (code) DO UPDATE SET
  name_cs = EXCLUDED.name_cs,
  description_cs = EXCLUDED.description_cs,
  base_price = EXCLUDED.base_price,
  free_shipping_threshold = EXCLUDED.free_shipping_threshold;

-- Personal Pickup - Prague (ACTIVE)
INSERT INTO shipping_methods (
  code,
  name_cs,
  description_cs,
  carrier_type,
  is_active,
  requires_address,
  requires_packeta_point,
  base_price,
  estimated_days,
  sort_order
) VALUES (
  'personal_pickup',
  'Osobní odběr - Praha',
  'Vyzvedněte si objednávku osobně v Praze. Zdarma.',
  'personal',
  true,
  false,
  false,
  0.00,
  'ihned',
  2
) ON CONFLICT (code) DO UPDATE SET
  name_cs = EXCLUDED.name_cs,
  description_cs = EXCLUDED.description_cs;

-- Personal Pickup - Invoice (ACTIVE)
INSERT INTO shipping_methods (
  code,
  name_cs,
  description_cs,
  carrier_type,
  is_active,
  requires_address,
  requires_packeta_point,
  base_price,
  estimated_days,
  sort_order
) VALUES (
  'personal_invoice',
  'Osobní odběr - Fakturace',
  'Osobní odběr s fakturací. Zdarma.',
  'personal',
  true,
  false,
  false,
  0.00,
  'ihned',
  3
) ON CONFLICT (code) DO UPDATE SET
  name_cs = EXCLUDED.name_cs,
  description_cs = EXCLUDED.description_cs;
