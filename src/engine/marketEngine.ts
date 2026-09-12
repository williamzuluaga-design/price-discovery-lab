import type { Buyer, Seller, Trade, TradeValidationResult } from '../types/market';

export function validateTrade(
  buyer: Buyer,
  seller: Seller,
  price: number,
  tradedBuyerIds: string[] = [],
  tradedSellerIds: string[] = [],
): TradeValidationResult {
  if (tradedBuyerIds.includes(buyer.id)) {
    return { valid: false, reason: `El comprador ${buyer.id} ya negoció en esta ronda` };
  }
  if (tradedSellerIds.includes(seller.id)) {
    return { valid: false, reason: `El vendedor ${seller.id} ya negoció en esta ronda` };
  }
  if (!Number.isFinite(price)) {
    return { valid: false, reason: 'Precio inválido' };
  }
  if (price < seller.value) {
    return {
      valid: false,
      reason: `El precio está por debajo del valor mínimo del vendedor (${seller.id})`,
      minPrice: seller.value,
      maxPrice: buyer.value,
    };
  }
  if (price > buyer.value) {
    return {
      valid: false,
      reason: `El precio excede la valoración máxima del comprador (${buyer.id})`,
      minPrice: seller.value,
      maxPrice: buyer.value,
    };
  }
  return {
    valid: true,
    minPrice: seller.value,
    maxPrice: buyer.value,
  };
}

export function buyerSurplus(buyerValue: number, price: number): number {
  return buyerValue - price;
}

export function sellerSurplus(price: number, sellerValue: number): number {
  return price - sellerValue;
}

export function totalSurplus(buyerValue: number, sellerValue: number): number {
  return buyerValue - sellerValue;
}

export function executeTrade(
  buyer: Buyer,
  seller: Seller,
  price: number,
  tradeNumber: number,
  sessionId: string,
  round: number,
): Trade {
  return {
    n: tradeNumber,
    sessionId,
    round,
    timestamp: new Date().toLocaleTimeString('es-CO', { hour12: false }),
    buyerId: buyer.id,
    sellerId: seller.id,
    price,
    buyerValue: buyer.value,
    sellerValue: seller.value,
    buyerSurplus: buyerSurplus(buyer.value, price),
    sellerSurplus: sellerSurplus(price, seller.value),
    totalSurplus: totalSurplus(buyer.value, seller.value),
  };
}

export function computeVWAP(trades: Trade[]): number | null {
  if (trades.length === 0) return null;
  const totalValue = trades.reduce((sum, t) => sum + t.price, 0);
  return totalValue / trades.length;
}

export function computeLastPrice(trades: Trade[]): number | null {
  if (trades.length === 0) return null;
  return trades[trades.length - 1].price;
}

export function computeHigh(trades: Trade[]): number | null {
  if (trades.length === 0) return null;
  return Math.max(...trades.map((t) => t.price));
}

export function computeLow(trades: Trade[]): number | null {
  if (trades.length === 0) return null;
  return Math.min(...trades.map((t) => t.price));
}

export function computeRealizedSurplus(trades: Trade[]): number {
  return trades.reduce((sum, t) => sum + t.totalSurplus, 0);
}

export function tradesForRound(trades: Trade[], round: number): Trade[] {
  return trades.filter((t) => t.round === round);
}
