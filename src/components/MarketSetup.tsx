import { useState } from 'react';
import type { useMarketSession } from '../state/useMarketSession';
import type { RoundMode } from '../types/market';
import { fmtCOP } from '../utils/format';

type Market = ReturnType<typeof useMarketSession>;

const ROUND_MODES: RoundMode[] = ['Dark Market', 'Public Tape', 'Order Book', 'Information Shock'];

export default function MarketSetup({ market, onStart }: { market: Market; onStart: () => void }) {
  const { session, configure, start, reset, newSession, nextRound } = market;
  const [roundSeconds, setRoundSeconds] = useState(session.roundSeconds);
  const [mode, setMode] = useState<RoundMode>(session.mode);

  return (
    <div>
      <div className="row row-between">
        <h1>Andina Tech S.A. <span className="sub">ANDT</span></h1>
        <span className="view-badge view-professor">Professor View</span>
      </div>

      <div className="grid grid-3 mt-16">
        <div className="card">
          <h3>Asset</h3>
          <div className="kpi">ANDT</div>
          <div className="sub">Acción ficticia para simulación educativa</div>
        </div>
        <div className="card">
          <h3>Buyers</h3>
          <div className="kpi">{session.buyers.length}</div>
          <div className="sub">valoraciones privadas</div>
        </div>
        <div className="card">
          <h3>Sellers</h3>
          <div className="kpi">{session.sellers.length}</div>
          <div className="sub">precios de reserva</div>
        </div>
      </div>

      <div className="card mt-16">
        <h2>Configuración de la sesión — Ronda {session.round}</h2>
        <div className="row" style={{ gap: '16px' }}>
          <label>
            Duración por ronda (seg)
            <input
              type="number"
              value={roundSeconds}
              min={30}
              step={30}
              onChange={(e) => setRoundSeconds(+e.target.value)}
            />
          </label>
          <label>
            Modo de ronda
            <select value={mode} onChange={(e) => setMode(e.target.value as RoundMode)}>
              {ROUND_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <button
            className="btn btn-cta"
            onClick={() => { configure(roundSeconds, mode); start(); onStart(); }}
          >
            START ROUND {session.round}
          </button>
          <button className="btn btn-secondary" onClick={nextRound}>Next Round</button>
          <button className="btn btn-secondary" onClick={reset}>Reset Round</button>
          <button className="btn btn-danger" onClick={newSession}>Nueva sesión</button>
        </div>
        <hr />
        <div className="notice">
          <b>Regla de validación:</b> una transacción es válida solo si{' '}
          <span className="ticker">seller value ≤ trade price ≤ buyer value</span>.
          <br />
          <b>Una unidad por trader:</b> cada comprador y vendedor puede negociar una sola vez por ronda.
        </div>
      </div>

      <div className="grid grid-2 mt-16">
        <div className="card">
          <h2>Compradores <span className="view-badge view-professor" style={{ marginLeft: 8 }}>Private</span></h2>
          <table>
            <thead>
              <tr><th>ID</th><th>Valoración máxima</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {session.buyers.map((b) => (
                <tr key={b.id}>
                  <td className="ticker">{b.id}</td>
                  <td className="ticker">{fmtCOP(b.value)}</td>
                  <td>{session.tradedBuyerIds.includes(b.id) ? <span style={{ color: 'var(--bad)' }}>Negoció</span> : <span style={{ color: 'var(--accent)' }}>Disponible</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2>Vendedores <span className="view-badge view-professor" style={{ marginLeft: 8 }}>Private</span></h2>
          <table>
            <thead>
              <tr><th>ID</th><th>Precio mínimo</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {session.sellers.map((s) => (
                <tr key={s.id}>
                  <td className="ticker">{s.id}</td>
                  <td className="ticker">{fmtCOP(s.value)}</td>
                  <td>{session.tradedSellerIds.includes(s.id) ? <span style={{ color: 'var(--bad)' }}>Negoció</span> : <span style={{ color: 'var(--accent)' }}>Disponible</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
