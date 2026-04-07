import { describe, it, expect } from 'vitest';
import { getPrice, PRICE_MAP, FREE_SHIPPING_THRESHOLD, SHIPPING_COST, COD_FEE } from './prices';

describe('prices', () => {
  it('returns correct price for each gram amount', () => {
    expect(getPrice('1g')).toBe(190);
    expect(getPrice('3g')).toBe(490);
    expect(getPrice('5g')).toBe(690);
    expect(getPrice('10g')).toBe(1290);
  });

  it('returns 190 for unknown gram amounts', () => {
    expect(getPrice('2g')).toBe(190);
    expect(getPrice('')).toBe(190);
    expect(getPrice('invalid')).toBe(190);
  });

  it('has correct constants', () => {
    expect(FREE_SHIPPING_THRESHOLD).toBe(1000);
    expect(SHIPPING_COST).toBe(79);
    expect(COD_FEE).toBe(30);
  });

  it('PRICE_MAP has all expected keys', () => {
    expect(Object.keys(PRICE_MAP)).toEqual(['1g', '3g', '5g', '10g']);
  });

  it('prices increase with gram amount', () => {
    expect(getPrice('1g')).toBeLessThan(getPrice('3g'));
    expect(getPrice('3g')).toBeLessThan(getPrice('5g'));
    expect(getPrice('5g')).toBeLessThan(getPrice('10g'));
  });
});
