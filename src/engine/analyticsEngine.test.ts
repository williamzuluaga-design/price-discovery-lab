import { describe, it, expect } from 'vitest';
import {
  efficientQuantity,
  maxPossibleSurplus,
  competitivePriceRange,
  marketEfficiency,
  buildRevealData,
  buildCurrentRoundRevealData,
  exportTradesToCSV,
} from './analyticsEngine';
import { DEFAULT_BUYERS, DEFAULT_SELLERS } from '../types/market';
import type { Buyer, Seller, Trade } from '../types/market';

function makeTrade(n: number, round: number, price: number, bv: number, sv: number): Trade {
  return {
    n, sessionId: 'sess-1', round, timestamp: '10:00', buyerId: 'B1', sellerId: 'S1',
    price, buyerValue: bv, sellerValue: sv,
    buyerSurplus: bv - price, sellerSurplus: price - sv, totalSurplus: bv - sv,
  };
}

describe('efficientQuantity', () => {
  it('returns 6 for default data (B06=27000 >= S06=27000, B07=26500 < S07=28500)', () => {
    expect(efficientQuantity(DEFAULT_BUYERS, DEFAULT_SELLERS)).toBe(6);
  });

  it('returns 0 when no buyer values exceed seller values', () => {
    const buyers: Buyer[] = [{ id: 'B1', value: 100 }];
    const sellers: Seller[] = [{ id: 'S1', value: 200 }];
    expect(efficientQuantity(buyers, sellers)).toBe(0);
  });

  it('returns full count when all buyers exceed all sellers', () => {
    const buyers: Buyer[] = [{ id: 'B1', value: 300 }, { id: 'B2', value: 200 }];
    const sellers: Seller[] = [{ id: 'S1', value: 100 }, { id: 'S2', value: 50 }];
    expect(efficientQuantity(buyers, sellers)).toBe(2);
  });
});

describe('maxPossibleSurplus', () => {
  it('matches manual calculation for default data', () => {
    // Sorted buyers desc: 30000, 29500, 29000, 28400, 27800, 27000, 26500, 25000
    // Sorted sellers asc: 23000, 24000, 24800, 25500, 26200, 27000, 28500, 30000
    // Q=6: surpluses = 7000+5500+4200+2900+1600+0 = 21200
    expect(maxPossibleSurplus(DEFAULT_BUYERS, DEFAULT_SELLERS)).toBe(21200);
  });

  it('returns 0 when no efficient trades possible', () => {
    const buyers: Buyer[] = [{ id: 'B1', value: 100 }];
    const sellers: Seller[] = [{ id: 'S1', value: 200 }];
    expect(maxPossibleSurplus(buyers, sellers)).toBe(0);
  });
});

describe('competitivePriceRange', () => {
  it('returns a valid range for default data', () => {
    const range = competitivePriceRange(DEFAULT_BUYERS, DEFAULT_SELLERS);
    expect(range).not.toBeNull();
    if (range) {
      expect(range.low).toBeLessThanOrEqual(range.high);
      expect(range.low).toBe(27000);
      expect(range.high).toBe(27000);
    }
  });

  it('returns null when Q=0', () => {
    const buyers: Buyer[] = [{ id: 'B1', value: 100 }];
    const sellers: Seller[] = [{ id: 'S1', value: 200 }];
    expect(competitivePriceRange(buyers, sellers)).toBeNull();
  });
});

describe('marketEfficiency', () => {
  it('returns null when max surplus is 0', () => {
    const buyers: Buyer[] = [{ id: 'B1', value: 100 }];
    const sellers: Seller[] = [{ id: 'S1', value: 200 }];
    expect(marketEfficiency(buyers, sellers, [])).toBeNull();
  });

  it('returns 100 when all efficient surplus is realized', () => {
    const buyers: Buyer[] = [{ id: 'B1', value: 30000 }];
    const sellers: Seller[] = [{ id: 'S1', value: 23000 }];
    const trades: Trade[] = [makeTrade(1, 1, 26500, 30000, 23000)];
    expect(marketEfficiency(buyers, sellers, trades)).toBeCloseTo(100);
  });

  it('returns partial efficiency for partial realization', () => {
    const buyers: Buyer[] = [{ id: 'B1', value: 30000 }, { id: 'B2', value: 28000 }];
    const sellers: Seller[] = [{ id: 'S1', value: 23000 }, { id: 'S2', value: 25000 }];
    const trades: Trade[] = [makeTrade(1, 1, 26500, 30000, 23000)];
    expect(marketEfficiency(buyers, sellers, trades)).toBeCloseTo(70, 0);
  });
});

describe('buildRevealData', () => {
  it('produces complete reveal data for default data with no trades', () => {
    const reveal = buildRevealData(DEFAULT_BUYERS, DEFAULT_SELLERS, []);
    expect(reveal.efficientQuantity).toBe(6);
    expect(reveal.maxSurplus).toBe(21200);
    expect(reveal.realizedSurplus).toBe(0);
    expect(reveal.marketEfficiency).toBeCloseTo(0);
    expect(reveal.demandSchedule).toHaveLength(8);
    expect(reveal.supplySchedule).toHaveLength(8);
    expect(reveal.demandSchedule[0].value).toBe(30000);
    expect(reveal.demandSchedule[7].value).toBe(25000);
    expect(reveal.supplySchedule[0].value).toBe(23000);
    expect(reveal.supplySchedule[7].value).toBe(30000);
  });
});

describe('buildCurrentRoundRevealData', () => {
  it('only counts trades from the current round', () => {
    const trades: Trade[] = [
      makeTrade(1, 1, 26500, 30000, 23000),
      makeTrade(2, 2, 26000, 29000, 24000),
    ];
    const reveal = buildCurrentRoundRevealData(DEFAULT_BUYERS, DEFAULT_SELLERS, trades, 2);
    // Only round 2 trade counts: surplus = 29000 - 24000 = 5000
    expect(reveal.realizedSurplus).toBe(5000);
    expect(reveal.marketEfficiency).toBeCloseTo((5000 / 21200) * 100, 0);
  });

  it('returns 0 realized surplus when no trades in current round', () => {
    const trades: Trade[] = [makeTrade(1, 1, 26500, 30000, 23000)];
    const reveal = buildCurrentRoundRevealData(DEFAULT_BUYERS, DEFAULT_SELLERS, trades, 2);
    expect(reveal.realizedSurplus).toBe(0);
    expect(reveal.marketEfficiency).toBeCloseTo(0);
  });
});

describe('exportTradesToCSV', () => {
  it('produces a valid CSV with correct headers using stored sessionId and round', () => {
    const trades: Trade[] = [makeTrade(1, 3, 26500, 30000, 23000)];
    const csv = exportTradesToCSV(trades);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('session_id,round,timestamp,buyer_id,seller_id,buyer_value,seller_value,trade_price,buyer_surplus,seller_surplus,total_surplus');
    expect(lines[1]).toBe('sess-1,3,10:00,B1,S1,30000,23000,26500,3500,3500,7000');
  });

  it('produces only header for empty trades', () => {
    const csv = exportTradesToCSV([]);
    expect(csv).toBe('session_id,round,timestamp,buyer_id,seller_id,buyer_value,seller_value,trade_price,buyer_surplus,seller_surplus,total_surplus');
  });

  it('uses per-trade round numbers, not a single session-level round', () => {
    const trades: Trade[] = [
      makeTrade(1, 1, 26000, 30000, 23000),
      makeTrade(2, 2, 27000, 29000, 24000),
      makeTrade(3, 3, 26500, 28000, 25000),
    ];
    const csv = exportTradesToCSV(trades);
    const lines = csv.split('\n');
    expect(lines[1]).toContain(',1,');
    expect(lines[2]).toContain(',2,');
    expect(lines[3]).toContain(',3,');
  });
});
