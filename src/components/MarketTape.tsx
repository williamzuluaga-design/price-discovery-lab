import type { Trade } from '../types/market';
import { fmtCOP } from '../utils/format';

interface MarketTapeProps {
  trades: Trade[];
  publicView?: boolean;
}

export default function MarketTape({ trades, publicView = false }: MarketTapeProps) {
  if (trades.length === 0) {
    return <div className="sub" style={{ padding: '16px 0' }}>Sin transacciones registradas.</div>;
  }
  if (publicView) {
    return (
      <table>
        <thead>
          <tr>
            <th>#</th><th>Hora</th><th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {[...trades].reverse().map((t) => (
            <tr key={t.n}>
              <td className="ticker">{t.n}</td>
              <td className="ticker">{t.timestamp}</td>
              <td className="ticker">{fmtCOP(t.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  return (
    <table>
      <thead>
        <tr>
          <th>#</th><th>Ronda</th><th>Hora</th><th>Buyer</th><th>Seller</th><th>Precio</th><th>Surplus</th>
        </tr>
      </thead>
      <tbody>
        {[...trades].reverse().map((t) => (
          <tr key={t.n}>
            <td className="ticker">{t.n}</td>
            <td className="ticker">{t.round}</td>
            <td className="ticker">{t.timestamp}</td>
            <td className="ticker">{t.buyerId}</td>
            <td className="ticker">{t.sellerId}</td>
            <td className="ticker">{fmtCOP(t.price)}</td>
            <td className="ticker">{fmtCOP(t.totalSurplus)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
