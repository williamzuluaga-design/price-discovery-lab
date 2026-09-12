import { useState, useMemo } from 'react';
import type { Buyer, Seller } from '../types/market';
import type { TradeResult } from '../state/useMarketSession';
import { validateTrade } from '../engine/marketEngine';
import { fmtCOP } from '../utils/format';

interface TradeTicketProps {
  buyers: Buyer[];
  sellers: Seller[];
  tradedBuyerIds: string[];
  tradedSellerIds: string[];
  onExecute: (buyerId: string, sellerId: string, price: number) => TradeResult;
  onClose: () => void;
  result: TradeResult | null;
}

export default function TradeTicket({ buyers, sellers, tradedBuyerIds, tradedSellerIds, onExecute, onClose, result }: TradeTicketProps) {
  const availableBuyers = useMemo(
    () => buyers.filter((b) => !tradedBuyerIds.includes(b.id)),
    [buyers, tradedBuyerIds],
  );
  const availableSellers = useMemo(
    () => sellers.filter((s) => !tradedSellerIds.includes(s.id)),
    [sellers, tradedSellerIds],
  );

  const [buyerId, setBuyerId] = useState(availableBuyers[0]?.id ?? '');
  const [sellerId, setSellerId] = useState(availableSellers[0]?.id ?? '');
  const [price, setPrice] = useState(27000);

  const handleExecute = () => {
    onExecute(buyerId, sellerId, price);
  };

  return (
    <div className="trade-ticket-overlay" onClick={onClose}>
      <div className="trade-ticket" onClick={(e) => e.stopPropagation()}>
        <div className="row row-between" style={{ marginBottom: '20px' }}>
          <h2>Trade Ticket</h2>
          <button className="btn btn-secondary" onClick={onClose}>✕</button>
        </div>
        {availableBuyers.length === 0 || availableSellers.length === 0 ? (
          <div className="ticket-msg error">
            No hay compradores o vendedores disponibles en esta ronda. Todos han negociado ya.
          </div>
        ) : (
          <div className="field-group">
            <label>
              Buyer ({availableBuyers.length} disponibles)
              <select value={buyerId} onChange={(e) => setBuyerId(e.target.value)}>
                {availableBuyers.map((b) => (
                  <option key={b.id} value={b.id}>{b.id}</option>
                ))}
              </select>
            </label>
            <label>
              Seller ({availableSellers.length} disponibles)
              <select value={sellerId} onChange={(e) => setSellerId(e.target.value)}>
                {availableSellers.map((s) => (
                  <option key={s.id} value={s.id}>{s.id}</option>
                ))}
              </select>
            </label>
            <label>
              Precio acordado COP
              <input
                type="number"
                value={price}
                step={50}
                onChange={(e) => setPrice(+e.target.value)}
              />
            </label>
            <button className="btn btn-cta" onClick={handleExecute}>VALIDATE & EXECUTE</button>
          </div>
        )}
        {result && (
          <div className={`ticket-msg ${result.success ? 'success' : 'error'}`}>
            {result.success ? '✓ ' : '✗ '}{result.message}
            {!result.success && (() => {
              const b = buyers.find((x) => x.id === buyerId);
              const s = sellers.find((x) => x.id === sellerId);
              if (b && s) {
                const v = validateTrade(b, s, price, tradedBuyerIds, tradedSellerIds);
                if (v.minPrice != null && v.maxPrice != null) {
                  return <div style={{ marginTop: '6px', fontSize: '12px' }}>Debe cumplirse {fmtCOP(v.minPrice)} ≤ precio ≤ {fmtCOP(v.maxPrice)}</div>;
                }
              }
              return null;
            })()}
          </div>
        )}
        {result?.trade && (
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--muted)' }}>
            <table>
              <tbody>
                <tr><th>Buyer surplus</th><td className="ticker">{fmtCOP(result.trade.buyerSurplus)}</td></tr>
                <tr><th>Seller surplus</th><td className="ticker">{fmtCOP(result.trade.sellerSurplus)}</td></tr>
                <tr><th>Total surplus</th><td className="ticker">{fmtCOP(result.trade.totalSurplus)}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
