import { describe, it, expect } from 'vitest';
import {
  createSession,
  startRound,
  advanceRound,
  resetRound,
  applyNewsShock,
  tick,
} from './gameEngine';


describe('createSession', () => {
  it('starts at round 1 in setup phase with empty traded sets', () => {
    const s = createSession();
    expect(s.round).toBe(1);
    expect(s.phase).toBe('setup');
    expect(s.tradedBuyerIds).toEqual([]);
    expect(s.tradedSellerIds).toEqual([]);
    expect(s.trades).toEqual([]);
  });
});

describe('startRound', () => {
  it('sets phase to open and clears traded sets', () => {
    const s = createSession();
    s.tradedBuyerIds = ['B01'];
    s.tradedSellerIds = ['S01'];
    const started = startRound(s);
    expect(started.phase).toBe('open');
    expect(started.tradedBuyerIds).toEqual([]);
    expect(started.tradedSellerIds).toEqual([]);
    expect(started.remainingSeconds).toBe(s.roundSeconds);
  });
});

describe('advanceRound', () => {
  it('increments round and resets to setup phase', () => {
    const s = createSession();
    s.round = 3;
    const next = advanceRound(s);
    expect(next.round).toBe(4);
    expect(next.phase).toBe('setup');
    expect(next.remainingSeconds).toBe(s.roundSeconds);
  });

  it('clears traded sets for the new round', () => {
    const s = createSession();
    s.tradedBuyerIds = ['B01', 'B02'];
    s.tradedSellerIds = ['S01'];
    const next = advanceRound(s);
    expect(next.tradedBuyerIds).toEqual([]);
    expect(next.tradedSellerIds).toEqual([]);
  });

  it('preserves trades from previous rounds', () => {
    const s = createSession();
    s.trades = [
      { n: 1, sessionId: s.sessionId, round: 1, timestamp: '10:00', buyerId: 'B01', sellerId: 'S01', price: 26500, buyerValue: 30000, sellerValue: 23000, buyerSurplus: 3500, sellerSurplus: 3500, totalSurplus: 7000 },
    ];
    const next = advanceRound(s);
    expect(next.trades).toHaveLength(1);
    expect(next.trades[0].round).toBe(1);
  });

  it('preserves buyer/seller value distribution', () => {
    const s = createSession();
    const originalBuyerValues = s.buyers.map((b) => b.value);
    const next = advanceRound(s);
    expect(next.buyers.map((b) => b.value)).toEqual(originalBuyerValues);
  });
});

describe('resetRound', () => {
  it('resets phase to setup and clears traded sets but keeps round number', () => {
    const s = createSession();
    s.round = 2;
    s.phase = 'closed';
    s.tradedBuyerIds = ['B01'];
    const r = resetRound(s);
    expect(r.round).toBe(2);
    expect(r.phase).toBe('setup');
    expect(r.tradedBuyerIds).toEqual([]);
  });
});

describe('tick', () => {
  it('decrements remaining seconds when open', () => {
    const s = createSession();
    const started = startRound(s);
    const ticked = tick(started);
    expect(ticked.remainingSeconds).toBe(started.remainingSeconds - 1);
  });

  it('closes market when time runs out', () => {
    const s = createSession();
    const started = startRound(s);
    started.remainingSeconds = 1;
    const ticked = tick(started);
    expect(ticked.phase).toBe('closed');
    expect(ticked.remainingSeconds).toBe(0);
  });

  it('does nothing when not open', () => {
    const s = createSession();
    expect(tick(s)).toBe(s);
  });
});

describe('applyNewsShock', () => {
  it('shifts buyer and seller values parametrically', () => {
    const s = createSession();
    const originalBuyerValue = s.buyers[0].value;
    const next = applyNewsShock(s, 'ratecut');
    // buyerShift = 0.06, rounded to nearest 50
    const expected = Math.round((originalBuyerValue * 1.06) / 50) * 50;
    expect(next.buyers[0].value).toBe(expected);
  });

  it('records the event in newsHistory', () => {
    const s = createSession();
    const next = applyNewsShock(s, 'earnings');
    expect(next.newsHistory).toHaveLength(1);
    expect(next.newsHistory[0].event).toBe('earnings');
  });

  it('can be applied when market is not open (between rounds)', () => {
    const s = createSession();
    s.phase = 'setup';
    const next = applyNewsShock(s, 'probe');
    expect(next.buyers[0].value).not.toBe(s.buyers[0].value);
  });
});
