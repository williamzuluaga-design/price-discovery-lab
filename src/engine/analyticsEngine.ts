import type { Buyer, Seller, RevealData, Trade } from '../types/market';
import { computeRealizedSurplus, tradesForRound } from './marketEngine';

export function efficientQuantity(buyers: Buyer[], sellers: Seller[]): number {
  const sortedBuyers = [...buyers].sort((a, b) => b.value - a.value);
  const sortedSellers = [...sellers].sort((a, b) => a.value - b.value);
  let q = 0;
  for (let i = 0; i < Math.min(sortedBuyers.length, sortedSellers.length); i++) {
    if (sortedBuyers[i].value >= sortedSellers[i].value) {
      q = i + 1;
    } else {
      break;
    }
  }
  return q;
}

export function maxPossibleSurplus(buyers: Buyer[], sellers: Seller[]): number {
  const sortedBuyers = [...buyers].sort((a, b) => b.value - a.value);
  const sortedSellers = [...sellers].sort((a, b) => a.value - b.value);
  let surplus = 0;
  for (let i = 0; i < Math.min(sortedBuyers.length, sortedSellers.length); i++) {
    if (sortedBuyers[i].value >= sortedSellers[i].value) {
      surplus += sortedBuyers[i].value - sortedSellers[i].value;
    } else {
      break;
    }
  }
  return surplus;
}

export function competitivePriceRange(
  buyers: Buyer[],
  sellers: Seller[],
): { low: number; high: number } | null {
  const sortedBuyers = [...buyers].sort((a, b) => b.value - a.value);
  const sortedSellers = [...sellers].sort((a, b) => a.value - b.value);
  const q = efficientQuantity(buyers, sellers);
  if (q === 0) return null;

  const marginalBuyer = sortedBuyers[q - 1].value;
  const marginalSeller = sortedSellers[q - 1].value;
  const nextBuyer = sortedBuyers[q]?.value ?? marginalBuyer;
  const nextSeller = sortedSellers[q]?.value ?? marginalSeller;

  let low = Math.max(marginalSeller, nextBuyer);
  let high = Math.min(marginalBuyer, nextSeller);

  if (low > high) {
    const mid = (marginalBuyer + marginalSeller) / 2;
    low = mid;
    high = mid;
  }

  return { low, high };
}

export function marketEfficiency(
  buyers: Buyer[],
  sellers: Seller[],
  trades: Trade[],
): number | null {
  const maxSurplus = maxPossibleSurplus(buyers, sellers);
  if (maxSurplus === 0) return null;
  const realized = computeRealizedSurplus(trades);
  return (realized / maxSurplus) * 100;
}

export function buildRevealData(
  buyers: Buyer[],
  sellers: Seller[],
  trades: Trade[],
): RevealData {
  const sortedBuyers = [...buyers].sort((a, b) => b.value - a.value);
  const sortedSellers = [...sellers].sort((a, b) => a.value - b.value);
  const q = efficientQuantity(buyers, sellers);
  const range = competitivePriceRange(buyers, sellers);
  const maxSurplus = maxPossibleSurplus(buyers, sellers);
  const realized = computeRealizedSurplus(trades);
  const efficiency = maxSurplus > 0 ? (realized / maxSurplus) * 100 : null;

  return {
    efficientQuantity: q,
    competitiveRange: range,
    maxSurplus,
    realizedSurplus: realized,
    marketEfficiency: efficiency,
    demandSchedule: sortedBuyers.map((b, i) => ({
      rank: i + 1,
      buyerId: b.id,
      value: b.value,
    })),
    supplySchedule: sortedSellers.map((s, i) => ({
      rank: i + 1,
      sellerId: s.id,
      value: s.value,
    })),
  };
}

export function buildCurrentRoundRevealData(
  buyers: Buyer[],
  sellers: Seller[],
  allTrades: Trade[],
  currentRound: number,
): RevealData {
  const currentTrades = tradesForRound(allTrades, currentRound);
  return buildRevealData(buyers, sellers, currentTrades);
}

export function exportTradesToCSV(trades: Trade[]): string {
  const cols = [
    'session_id',
    'round',
    'timestamp',
    'buyer_id',
    'seller_id',
    'buyer_value',
    'seller_value',
    'trade_price',
    'buyer_surplus',
    'seller_surplus',
    'total_surplus',
  ];
  const header = cols.join(',');
  const rows = trades.map((t) =>
    [
      t.sessionId,
      t.round,
      t.timestamp,
      t.buyerId,
      t.sellerId,
      t.buyerValue,
      t.sellerValue,
      t.price,
      t.buyerSurplus,
      t.sellerSurplus,
      t.totalSurplus,
    ].join(','),
  );
  return [header, ...rows].join('\n');
}
