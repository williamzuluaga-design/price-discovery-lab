import { describe, it, expect } from 'vitest';
import {
  validateTrade,
  buyerSurplus,
  sellerSurplus,
  totalSurplus,
  executeTrade,
  computeVWAP,
  computeLastPrice,
  computeHigh,
  computeLow,
  computeRealizedSurplus,
} from './marketEngine';
import type { Buyer, Seller, Trade } from '../types/market';

const buyer: Buyer = { id: 'B01', value: 30000 };
const seller: Seller = { id: 'S01', value: 23000 };

describe('validateTrade', () => {
  it('accepts a trade at the midpoint', () => {
    const r = validateTrade(buyer, seller, 26500);
    expect(r.valid).toBe(true);
    expect(r.minPrice).toBe(23000);
    expect(r.maxPrice).toBe(30000);
  });

  it('accepts a trade exactly at seller value', () => {
    expect(validateTrade(buyer, seller, 23000).valid).toBe(true);
  });

  it('accepts a trade exactly at buyer value', () => {
    expect(validateTrade(buyer, seller, 30000).valid).toBe(true);
  });

  it('rejects a trade below seller value', () => {
    const r = validateTrade(buyer, seller, 22000);
    expect(r.valid).toBe(false);
    expect(r.reason).toContain('vendedor');
  });

  it('rejects a trade above buyer value', () => {
    const r = validateTrade(buyer, seller, 31000);
    expect(r.valid).toBe(false);
    expect(r.reason).toContain('comprador');
  });

  it('rejects NaN price', () => {
    expect(validateTrade(buyer, seller, NaN).valid).toBe(false);
  });
});

describe('surplus functions', () => {
  it('buyerSurplus = buyerValue - price', () => {
    expect(buyerSurplus(30000, 26500)).toBe(3500);
  });

  it('sellerSurplus = price - sellerValue', () => {
    expect(sellerSurplus(26500, 23000)).toBe(3500);
  });

  it('totalSurplus = buyerValue - sellerValue', () => {
    expect(totalSurplus(30000, 23000)).toBe(7000);
  });

  it('totalSurplus = buyerSurplus + sellerSurplus', () => {
    const bs = buyerSurplus(30000, 26500);
    const ss = sellerSurplus(26500, 23000);
    expect(bs + ss).toBe(totalSurplus(30000, 23000));
  });
});

describe('executeTrade', () => {
  it('produces a complete Trade object', () => {
    const t = executeTrade(buyer, seller, 26500, 1);
    expect(t.n).toBe(1);
    expect(t.buyerId).toBe('B01');
    expect(t.sellerId).toBe('S01');
    expect(t.price).toBe(26500);
    expect(t.buyerValue).toBe(30000);
    expect(t.sellerValue).toBe(23000);
    expect(t.buyerSurplus).toBe(3500);
    expect(t.sellerSurplus).toBe(3500);
    expect(t.totalSurplus).toBe(7000);
    expect(typeof t.timestamp).toBe('string');
  });
});

describe('market stats', () => {
  const trades: Trade[] = [
    { n: 1, timestamp: '10:00', buyerId: 'B1', sellerId: 'S1', price: 26000, buyerValue: 30000, sellerValue: 23000, buyerSurplus: 4000, sellerSurplus: 3000, totalSurplus: 7000 },
    { n: 2, timestamp: '10:01', buyerId: 'B2', sellerId: 'S2', price: 27000, buyerValue: 29000, sellerValue: 24000, buyerSurplus: 2000, sellerSurplus: 3000, totalSurplus: 5000 },
    { n: 3, timestamp: '10:02', buyerId: 'B3', sellerId: 'S3', price: 26500, buyerValue: 28000, sellerValue: 25000, buyerSurplus: 1500, sellerSurplus: 1500, totalSurplus: 3000 },
  ];

  it('computeLastPrice returns last trade price', () => {
    expect(computeLastPrice(trades)).toBe(26500);
  });

  it('computeLastPrice returns null for empty', () => {
    expect(computeLastPrice([])).toBeNull();
  });

  it('computeVWAP returns average price', () => {
    expect(computeVWAP(trades)).toBeCloseTo((26000 + 27000 + 26500) / 3);
  });

  it('computeVWAP returns null for empty', () => {
    expect(computeVWAP([])).toBeNull();
  });

  it('computeHigh returns max price', () => {
    expect(computeHigh(trades)).toBe(27000);
  });

  it('computeLow returns min price', () => {
    expect(computeLow(trades)).toBe(26000);
  });

  it('computeRealizedSurplus sums all surpluses', () => {
    expect(computeRealizedSurplus(trades)).toBe(7000 + 5000 + 3000);
  });

  it('computeRealizedSurplus is 0 for empty', () => {
    expect(computeRealizedSurplus([])).toBe(0);
  });
});
