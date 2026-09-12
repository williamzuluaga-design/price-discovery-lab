import type { MarketSession, Trade } from '../types/market';
import type { MarketRepository } from './repository';

const STORAGE_KEY = 'pdl_session_v1';

export class LocalRepository implements MarketRepository {
  async loadSession(): Promise<MarketSession | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as MarketSession;
    } catch {
      return null;
    }
  }

  async saveSession(session: MarketSession): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // storage full or unavailable — silently ignore for V1
    }
  }

  async appendTrade(_trade: Trade): Promise<void> {
    // In V1, trades are saved as part of the session via saveSession.
    // This method exists for the V2 Supabase implementation to insert rows individually.
  }

  async clearSession(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
