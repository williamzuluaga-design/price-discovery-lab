import type { useMarketSession } from '../state/useMarketSession';
import { buildCurrentRoundRevealData } from '../engine/analyticsEngine';
import { computeRealizedSurplus, tradesForRound } from '../engine/marketEngine';
import { fmtCOP, fmtPct } from '../utils/format';

type Market = ReturnType<typeof useMarketSession>;

export default function MarketReveal({ market }: { market: Market }) {
  const { session } = market;
  const currentRoundTrades = tradesForRound(session.trades, session.round);
  const reveal = buildCurrentRoundRevealData(session.buyers, session.sellers, session.trades, session.round);
  const sessionSurplus = computeRealizedSurplus(session.trades);

  return (
    <div>
      <div className="row row-between">
        <h1>Market Reveal</h1>
        <span className="view-badge view-professor">Professor View — Debrief</span>
      </div>

      <div className="grid grid-3 mt-16">
        <div className="card">
          <h3>Efficient quantity (round {session.round})</h3>
          <div className="kpi">{reveal.efficientQuantity}</div>
        </div>
        <div className="card">
          <h3>Competitive range (round {session.round})</h3>
          <div className="kpi-small ticker">
            {reveal.competitiveRange
              ? `${fmtCOP(reveal.competitiveRange.low)} — ${fmtCOP(reveal.competitiveRange.high)}`
              : '—'}
          </div>
        </div>
        <div className="card">
          <h3>Market efficiency (round {session.round})</h3>
          <div className="kpi">{fmtPct(reveal.marketEfficiency)}</div>
        </div>
      </div>

      <div className="grid grid-2-even mt-16">
        <div className="card">
          <h2>Demand — valores comprador</h2>
          <table>
            <thead>
              <tr><th>Rank</th><th>Buyer</th><th>Valoración</th></tr>
            </thead>
            <tbody>
              {reveal.demandSchedule.map((d) => (
                <tr key={d.buyerId}>
                  <td className="ticker">Q{d.rank}</td>
                  <td className="ticker">{d.buyerId}</td>
                  <td className="ticker">{fmtCOP(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2>Supply — costos vendedor</h2>
          <table>
            <thead>
              <tr><th>Rank</th><th>Seller</th><th>Costo</th></tr>
            </thead>
            <tbody>
              {reveal.supplySchedule.map((s) => (
                <tr key={s.sellerId}>
                  <td className="ticker">Q{s.rank}</td>
                  <td className="ticker">{s.sellerId}</td>
                  <td className="ticker">{fmtCOP(s.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-16">
        <h2>Debrief — Round {session.round}</h2>
        <p style={{ marginTop: '8px' }}>
          <b>Pregunta central:</b> Si ningún participante conocía toda la distribución de valores y costos, ¿quién determinó el precio observado?
        </p>
        <p className="sub" style={{ marginTop: '8px' }}>
          Compare el precio de cierre, la trayectoria de transacciones, el rango competitivo y la eficiencia realizada.
        </p>
        <hr />
        <h3>Current round ({session.round})</h3>
        <table>
          <tbody>
            <tr><th>Trades this round</th><td className="ticker">{currentRoundTrades.length}</td></tr>
            <tr><th>Maximum possible surplus</th><td className="ticker">{fmtCOP(reveal.maxSurplus)}</td></tr>
            <tr><th>Realized surplus (this round)</th><td className="ticker">{fmtCOP(reveal.realizedSurplus)}</td></tr>
            <tr><th>Market efficiency</th><td className="ticker">{fmtPct(reveal.marketEfficiency)}</td></tr>
          </tbody>
        </table>
        <hr />
        <h3>Session totals</h3>
        <table>
          <tbody>
            <tr><th>Total trades (all rounds)</th><td className="ticker">{session.trades.length}</td></tr>
            <tr><th>Total realized surplus (all rounds)</th><td className="ticker">{fmtCOP(sessionSurplus)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
