import { useState } from 'react';
import type { useMarketSession } from '../state/useMarketSession';
import type { TradeResult } from '../state/useMarketSession';
import { computeLastPrice, computeVWAP, computeHigh, computeLow, computeRealizedSurplus } from '../engine/marketEngine';
import { exportTradesToCSV } from '../engine/analyticsEngine';
import { fmtCOP } from '../utils/format';
import PriceChart from './PriceChart';
import MarketTape from './MarketTape';
import TradeTicket from './TradeTicket';

type Market = ReturnType<typeof useMarketSession>;

export default function TradingFloor({ market }: { market: Market }) {
  const { session, pause, registerTrade } = market;
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketResult, setTicketResult] = useState<TradeResult | null>(null);

  const trades = session.trades;
  const lastPrice = computeLastPrice(trades);
  const vwap = computeVWAP(trades);
  const high = computeHigh(trades);
  const low = computeLow(trades);
  const surplus = computeRealizedSurplus(trades);

  const handleExport = () => {
    const csv = exportTradesToCSV(session.sessionId, session.round, trades);
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
          <div className="sub">{session.mode} <span className="view-badge view-public" style={{ marginLeft: 8 }}>Public Market View</span></div>
        </div>
        <div className="row">
          <button className="btn btn-secondary" onClick={pause}>
            {session.phase === 'open' ? 'Pause' : 'Resume'}
          </button>
          <button className="btn btn-cta" onClick={() => { setTicketOpen(true); setTicketResult(null); }}>
            REGISTER TRADE
          </button>
          <button className="btn btn-secondary" onClick={handleExport}>Export CSV</button>
        </div>
      </div>

      <div className="grid grid-3 mt-16">
        <div className="card">
          <h3>Last Price</h3>
          <div className="kpi ticker">{fmtCOP(lastPrice)}</div>
        </div>
        <div className="card">
          <h3>VWAP</h3>
          <div className="kpi ticker">{fmtCOP(vwap)}</div>
        </div>
        <div className="card">
          <h3>Volume</h3>
          <div className="kpi ticker">{trades.length}</div>
        </div>
      </div>

      <div className="grid grid-2 mt-16">
        <div className="card">
          <h2>Price path</h2>
          <PriceChart trades={trades} />
        </div>
        <div className="card">
          <h2>Market stats</h2>
          <table>
            <tbody>
              <tr><th>High</th><td className="ticker">{fmtCOP(high)}</td></tr>
              <tr><th>Low</th><td className="ticker">{fmtCOP(low)}</td></tr>
              <tr><th>Trades</th><td className="ticker">{trades.length}</td></tr>
              <tr><th>Total surplus</th><td className="ticker">{fmtCOP(surplus)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-16">
        <h2>Market Tape</h2>
        <MarketTape trades={trades} />
      </div>

      {ticketOpen && (
        <TradeTicket
          buyers={session.buyers}
          sellers={session.sellers}
          onExecute={handleExecute}
          onClose={() => setTicketOpen(false)}
          result={ticketResult}
        />
      )}
    </div>
  );
}
