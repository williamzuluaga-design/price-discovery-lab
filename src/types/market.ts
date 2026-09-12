export interface Buyer {
  id: string;
  value: number;
}

export interface Seller {
  id: string;
  value: number;
}

export interface Trade {
  n: number;
  timestamp: string;
  buyerId: string;
  sellerId: string;
  price: number;
  buyerValue: number;
  sellerValue: number;
  buyerSurplus: number;
  sellerSurplus: number;
  totalSurplus: number;
}

export type RoundMode = 'Dark Market' | 'Public Tape' | 'Order Book' | 'Information Shock';

export type MarketPhase = 'setup' | 'open' | 'paused' | 'closed';

export type NewsEventType = 'ratecut' | 'earnings' | 'probe';

export interface NewsShock {
  buyerShift: number;
  sellerShift: number;
}

export interface MarketSession {
  sessionId: string;
  round: number;
  mode: RoundMode;
  phase: MarketPhase;
  roundSeconds: number;
  remainingSeconds: number;
  buyers: Buyer[];
  sellers: Seller[];
  trades: Trade[];
  newsHistory: { event: NewsEventType; timestamp: string }[];
  createdAt: string;
}

export interface TradeValidationResult {
  valid: boolean;
  reason?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface RevealData {
  efficientQuantity: number;
  competitiveRange: { low: number; high: number } | null;
  maxSurplus: number;
  realizedSurplus: number;
  marketEfficiency: number | null;
  demandSchedule: { rank: number; buyerId: string; value: number }[];
  supplySchedule: { rank: number; sellerId: string; value: number }[];
}

export const DEFAULT_BUYERS: Buyer[] = [
  { id: 'B01', value: 30000 },
  { id: 'B02', value: 29500 },
  { id: 'B03', value: 29000 },
  { id: 'B04', value: 28400 },
  { id: 'B05', value: 27800 },
  { id: 'B06', value: 27000 },
  { id: 'B07', value: 26500 },
  { id: 'B08', value: 25000 },
];

export const DEFAULT_SELLERS: Seller[] = [
  { id: 'S01', value: 23000 },
  { id: 'S02', value: 24000 },
  { id: 'S03', value: 24800 },
  { id: 'S04', value: 25500 },
  { id: 'S05', value: 26200 },
  { id: 'S06', value: 27000 },
  { id: 'S07', value: 28500 },
  { id: 'S08', value: 30000 },
];

export const NEWS_SHOCKS: Record<NewsEventType, { label: string; shock: NewsShock }> = {
  ratecut: {
    label: 'BanRep reduce inesperadamente 50 pb la tasa de política monetaria',
    shock: { buyerShift: 0.06, sellerShift: 0.04 },
  },
  earnings: {
    label: 'ANDT reporta EBITDA 12% superior al consenso',
    shock: { buyerShift: 0.08, sellerShift: 0.06 },
  },
  probe: {
    label: 'Autoridad anuncia investigación regulatoria sobre ANDT',
    shock: { buyerShift: -0.08, sellerShift: -0.06 },
  },
};
