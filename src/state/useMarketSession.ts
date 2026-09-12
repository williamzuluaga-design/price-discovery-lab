import { useCallback, useEffect, useRef, useState } from 'react';
import type { MarketSession, NewsEventType, RoundMode, Trade } from '../types/market';
import { createSession, startRound, pauseRound, tick, resetRound, applyNewsShock } from '../engine/gameEngine';
import { validateTrade, executeTrade } from '../engine/marketEngine';
import { LocalRepository } from '../data/localRepository';
import type { MarketRepository } from '../data/repository';

const repository: MarketRepository = new LocalRepository();

export type TradeResult = {
  success: boolean;
  message: string;
  trade?: Trade;
};

export function useMarketSession() {
  const [session, setSession] = useState<MarketSession>(() => createSession());
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    repository.loadSession().then((saved) => {
      if (saved) setSession(saved);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) repository.saveSession(session);
  }, [session, loaded]);

  useEffect(() => {
    if (session.phase === 'open') {
      timerRef.current = setInterval(() => {
        setSession((prev) => tick(prev));
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [session.phase]);

  const configure = useCallback((roundSeconds: number, mode: RoundMode) => {
    setSession((prev) => ({ ...prev, roundSeconds, mode }));
  }, []);

  const start = useCallback(() => {
    setSession((prev) => startRound(prev));
  }, []);

  const pause = useCallback(() => {
    setSession((prev) => pauseRound(prev));
  }, []);

  const reset = useCallback(() => {
    setSession((prev) => resetRound(prev));
  }, []);

  const registerTrade = useCallback(
    (buyerId: string, sellerId: string, price: number): TradeResult => {
      let result: TradeResult = { success: false, message: '' };
      setSession((prev) => {
        const buyer = prev.buyers.find((b) => b.id === buyerId);
        const seller = prev.sellers.find((s) => s.id === sellerId);
        if (!buyer || !seller) {
          result = { success: false, message: 'Comprador o vendedor no encontrado' };
          return prev;
        }
        const validation = validateTrade(buyer, seller, price);
        if (!validation.valid) {
          result = {
            success: false,
            message: validation.reason ?? 'Trade rechazado',
          };
          return prev;
        }
        const trade = executeTrade(buyer, seller, price, prev.trades.length + 1);
        result = {
          success: true,
          message: `Trade ejecutado: comprador surplus COP ${trade.buyerSurplus.toLocaleString('es-CO')}, vendedor surplus COP ${trade.sellerSurplus.toLocaleString('es-CO')}`,
          trade,
        };
        return { ...prev, trades: [...prev.trades, trade] };
      });
      return result;
    },
    [],
  );

  const releaseNews = useCallback((event: NewsEventType) => {
    setSession((prev) => applyNewsShock(prev, event));
  }, []);

  const newSession = useCallback(() => {
    const fresh = createSession(session.roundSeconds, session.mode);
    setSession(fresh);
    repository.clearSession();
  }, [session.roundSeconds, session.mode]);

  return {
    session,
    loaded,
    configure,
    start,
    pause,
    reset,
    registerTrade,
    releaseNews,
    newSession,
  };
}
