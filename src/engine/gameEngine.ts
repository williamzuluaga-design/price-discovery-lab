import type {
  MarketSession,
  NewsEventType,
  RoundMode,
} from '../types/market';
import { DEFAULT_BUYERS, DEFAULT_SELLERS, NEWS_SHOCKS } from '../types/market';

export function createSession(
  roundSeconds: number = 180,
  mode: RoundMode = 'Public Tape',
): MarketSession {
  return {
    sessionId: crypto.randomUUID(),
    round: 1,
    mode,
    phase: 'setup',
    roundSeconds,
    remainingSeconds: roundSeconds,
    buyers: DEFAULT_BUYERS.map((b) => ({ ...b })),
    sellers: DEFAULT_SELLERS.map((s) => ({ ...s })),
    trades: [],
    tradedBuyerIds: [],
    tradedSellerIds: [],
    newsHistory: [],
    createdAt: new Date().toISOString(),
  };
}

export function startRound(session: MarketSession): MarketSession {
  return {
    ...session,
    phase: 'open',
    remainingSeconds: session.roundSeconds,
    tradedBuyerIds: [],
    tradedSellerIds: [],
  };
}

export function pauseRound(session: MarketSession): MarketSession {
  if (session.phase === 'open') return { ...session, phase: 'paused' };
  if (session.phase === 'paused') return { ...session, phase: 'open' };
  return session;
}

export function tick(session: MarketSession): MarketSession {
  if (session.phase !== 'open') return session;
  const remaining = session.remainingSeconds - 1;
  if (remaining <= 0) {
    return { ...session, remainingSeconds: 0, phase: 'closed' };
  }
  return { ...session, remainingSeconds: remaining };
}

export function advanceRound(session: MarketSession): MarketSession {
  return {
    ...session,
    round: session.round + 1,
    phase: 'setup',
    remainingSeconds: session.roundSeconds,
    tradedBuyerIds: [],
    tradedSellerIds: [],
  };
}

export function resetRound(session: MarketSession): MarketSession {
  return {
    ...session,
    phase: 'setup',
    remainingSeconds: session.roundSeconds,
    tradedBuyerIds: [],
    tradedSellerIds: [],
  };
}

export function applyNewsShock(
  session: MarketSession,
  event: NewsEventType,
): MarketSession {
  const { shock } = NEWS_SHOCKS[event];
  const buyers = session.buyers.map((b) => ({
    ...b,
    value: Math.round((b.value * (1 + shock.buyerShift)) / 50) * 50,
  }));
  const sellers = session.sellers.map((s) => ({
    ...s,
    value: Math.round((s.value * (1 + shock.sellerShift)) / 50) * 50,
  }));
  return {
    ...session,
    buyers,
    sellers,
    newsHistory: [
      ...session.newsHistory,
      { event, timestamp: new Date().toISOString() },
    ],
  };
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
