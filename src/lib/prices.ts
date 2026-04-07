/**
 * Centralized price map for all gram amounts.
 * Single source of truth — used by CartContext, Checkout, and product displays.
 * Future: load dynamically from Supabase products table.
 */
export const PRICE_MAP: Record<string, number> = {
  '1g': 190,
  '3g': 490,
  '5g': 690,
  '10g': 1290,
};

export const FREE_SHIPPING_THRESHOLD = 1000;
export const SHIPPING_COST = 79;
export const COD_FEE = 30;
export const PERSONAL_PICKUP_MIN_GRAMS = 10;

export function getPrice(gramAmount: string): number {
  return PRICE_MAP[gramAmount] || 190;
}
