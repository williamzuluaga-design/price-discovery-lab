import { useState } from 'react';
import type { useMarketSession } from '../state/useMarketSession';
import type { NewsEventType } from '../types/market';
import { NEWS_SHOCKS } from '../types/market';

type Market = ReturnType<typeof useMarketSession>;

export default function BreakingNews({ market }: { market: Market }) {
  const { session, releaseNews } = market;
  const [selected, setSelected] = useState<NewsEventType>('ratecut');
  const [released, setReleased] = useState<string | null>(null);

  const handleRelease = () => {
    releaseNews(selected);
    setReleased(NEWS_SHOCKS[selected].label);
  };

  return (
    <div>
      <h1>Breaking News Console</h1>

      <div className="card mt-16">
        <h2>Seleccionar evento</h2>
        <div className="row" style={{ gap: '16px' }}>
          <label style={{ flex: 1, minWidth: '300px' }}>
            Evento informativo
            <select value={selected} onChange={(e) => setSelected(e.target.value as NewsEventType)}>
              {(Object.entries(NEWS_SHOCKS) as [NewsEventType, { label: string }][]).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </label>
          <button className="btn btn-cta" onClick={handleRelease}>RELEASE NEWS</button>
        </div>
      </div>

      {released && (
        <div className="news-box mt-16">
          <b>BREAKING NEWS</b>
          <h2 style={{ marginTop: '8px' }}>{released}</h2>
          <div className="sub">Shock aplicado a las valoraciones privadas para la siguiente ronda.</div>
        </div>
      )}

      <div className="card mt-16">
        <h2>Impacto pedagógico</h2>
        <p className="sub">
          El shock ajusta las valoraciones privadas de forma parametrizada. En V2 puede enviarse información diferenciada por jugador.
        </p>
        {session.newsHistory.length > 0 && (
          <>
            <hr />
            <h3>Eventos aplicados en esta sesión</h3>
            <table>
              <thead>
                <tr><th>Evento</th><th>Timestamp</th></tr>
              </thead>
              <tbody>
                {session.newsHistory.map((h, i) => (
                  <tr key={i}>
                    <td>{NEWS_SHOCKS[h.event].label}</td>
                    <td className="ticker">{new Date(h.timestamp).toLocaleTimeString('es-CO', { hour12: false })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
