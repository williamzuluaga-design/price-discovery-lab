import type { MarketSession, Trade } from '../types/market';

export interface MarketRepository {
  loadSession(): Promise<MarketSession | null>;
  saveSession(session: MarketSession): Promise<void>;
  appendTrade(trade: Trade): Promise<void>;
  clearSession(): Promise<void>;
}
