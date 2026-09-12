import { useState } from 'react';
import type { useMarketSession } from '../state/useMarketSession';
import type { TradeResult } from '../state/useMarketSession';
import { computeLastPrice, computeVWAP, computeHigh, computeLow, computeRealizedSurplus, tradesForRound } from '../engine/marketEngine';
import { exportTradesToCSV } from '../engine/analyticsEngine';
import { fmtCOP } from '../utils/format';
import PriceChart from './PriceChart';
import MarketTape from './MarketTape';
import TradeTicket from './TradeTicket';

type Market = ReturnType<typeof useMarketSession>;

export default function TradingFloor({ market }: { market: Market }) {
  const { session, pause, registerTrade, nextRound } = market;
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketResult, setTicketResult] = useState<TradeResult | null>(null);

  const currentRoundTrades = tradesForRound(session.trades, session.round);
  const lastPrice = computeLastPrice(currentRoundTrades);
  const vwap = computeVWAP(currentRoundTrades);
  const high = computeHigh(currentRoundTrades);
  const low = computeLow(currentRoundTrades);
  const surplus = computeRealizedSurplus(currentRoundTrades);

  const sessionVolume = session.trades.length;
  const sessionHigh = computeHigh(session.trades);
  const sessionLow = computeLow(session.trades);
  const sessionVWAP = computeVWAP(session.trades);

  const handleExport = () => {
    const csv = exportTradesToCSV(session.trades);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'price_discovery_trades.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecute = (buyerId: string, sellerId: string, price: number) => {
    const result = registerTrade(buyerId, sellerId, price);
    setTicketResult(result);
    return result;
  };

  return (
    <div>
      <div className="row row-between">
        <div>
          <h1>Trading Floor — ANDT</h1>
          <div className="sub">
            {session.mode} · Ronda {session.round}
            <span className="view-badge view-public" style={{ marginLeft: 8 }}>Public Market View</span>
          </div>
        </div>
        <div className="row">
          <button className="btn btn-secondary" onClick={pause}>
            {session.phase === 'open' ? 'Pause' : 'Resume'}
          </button>
          <button className="btn btn-cta" onClick={() => { setTicketOpen(true); setTicketResult(null); }}>
            REGISTER TRADE
          </button>
          <button className="btn btn-secondary" onClick={nextRound}>Next Round</button>
          <button className="btn btn-secondary" onClick={handleExport}>Export CSV</button>
        </div>
      </div>

      <div className="grid grid-3 mt-16">
        <div className="card">
          <h3>Last Price (this round)</h3>
          <div className="kpi ticker">{fmtCOP(lastPrice)}</div>
        </div>
        <div className="card">
          <h3>VWAP (this round)</h3>
          <div className="kpi ticker">{fmtCOP(vwap)}</div>
        </div>
        <div className="card">
          <h3>Volume (this round)</h3>
          <div className="kpi ticker">{currentRoundTrades.length}</div>
        </div>
      </div>

      <div className="grid grid-2 mt-16">
        <div className="card">
          <h2>Price path (this round)</h2>
          <PriceChart trades={currentRoundTrades} />
        </div>
        <div className="card">
          <h2>Market stats — Round {session.round}</h2>
          <table>
            <tbody>
              <tr><th>High</th><td className="ticker">{fmtCOP(high)}</td></tr>
              <tr><th>Low</th><td className="ticker">{fmtCOP(low)}</td></tr>
              <tr><th>Trades</th><td className="ticker">{currentRoundTrades.length}</td></tr>
              <tr><th>Surplus</th><td className="ticker">{fmtCOP(surplus)}</td></tr>
            </tbody>
          </table>
          <hr />
          <h3>Session totals</h3>
          <table>
            <tbody>
              <tr><th>Session volume</th><td className="ticker">{sessionVolume}</td></tr>
              <tr><th>Session high</th><td className="ticker">{fmtCOP(sessionHigh)}</td></tr>
              <tr><th>Session low</th><td className="ticker">{fmtCOP(sessionLow)}</td></tr>
              <tr><th>Session VWAP</th><td className="ticker">{fmtCOP(sessionVWAP)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-16">
        <h2>Market Tape <span className="view-badge view-public" style={{ marginLeft: 8 }}>Public</span></h2>
        <MarketTape trades={currentRoundTrades} publicView />
      </div>

      <div className="card mt-16">
        <h2>Full Trade Tape <span className="view-badge view-professor" style={{ marginLeft: 8 }}>Professor</span></h2>
        <MarketTape trades={session.trades} />
      </div>

      {ticketOpen && (
        <TradeTicket
          buyers={session.buyers}
          sellers={session.sellers}
          tradedBuyerIds={session.tradedBuyerIds}
          tradedSellerIds={session.tradedSellerIds}
          onExecute={handleExecute}
          onClose={() => setTicketOpen(false)}
          result={ticketResult}
        />
      )}
    </div>
  );
}
