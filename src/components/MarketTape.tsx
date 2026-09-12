import type { Trade } from '../types/market';
import { fmtCOP } from '../utils/format';

export default function MarketTape({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) {
    return <div className="sub" style={{ padding: '16px 0' }}>Sin transacciones registradas.</div>;
  }
  return (
    <table>
      <thead>
        <tr>
          <th>#</th><th>Hora</th><th>Buyer</th><th>Seller</th><th>Precio</th><th>Surplus</th>
        </tr>
      </thead>
      <tbody>
        {[...trades].reverse().map((t) => (
          <tr key={t.n}>
            <td className="ticker">{t.n}</td>
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
