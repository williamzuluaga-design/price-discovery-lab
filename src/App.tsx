import { useState } from 'react';
import { useMarketSession } from './state/useMarketSession';
import { formatClock } from './engine/gameEngine';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MarketSetup from './components/MarketSetup';
import TradingFloor from './components/TradingFloor';
import BreakingNews from './components/BreakingNews';
import MarketReveal from './components/MarketReveal';

export type ViewId = 'setup' | 'floor' | 'news' | 'reveal';

export default function App() {
  const market = useMarketSession();
  const [view, setView] = useState<ViewId>('setup');

  const phase = market.session.phase;
  const statusText = phase === 'open' ? 'MARKET OPEN' : phase === 'paused' ? 'PAUSED' : 'MARKET CLOSED';
  const statusClass = phase === 'open' ? 'pill-open' : phase === 'paused' ? 'pill-paused' : 'pill-closed';

  return (
    <>
      <Header statusText={statusText} statusClass={statusClass} clock={formatClock(market.session.remainingSeconds)} />
      <div className="app-body">
        <Sidebar activeView={view} onNavigate={setView} />
        <main className="main-content">
          {view === 'setup' && <MarketSetup market={market} />}
          {view === 'floor' && <TradingFloor market={market} />}
          {view === 'news' && <BreakingNews market={market} />}
          {view === 'reveal' && <MarketReveal market={market} />}
          <div className="app-footer">
            Price Discovery Lab V1 — Simulador educativo local. No usa backend, login ni datos reales de mercado.
          </div>
        </main>
      </div>
    </>
  );
}
