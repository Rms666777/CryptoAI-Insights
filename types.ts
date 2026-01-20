export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number | null;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null | {
    times: number;
    currency: string;
    percentage: number;
  };
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export enum AnalysisType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY'
}

export enum AIProvider {
  GEMINI = 'GEMINI',
  OPENROUTER = 'OPENROUTER',
  HYBRID = 'HYBRID' // Gemini + OpenRouter Cross-check
}

export enum AIPersona {
  CONSERVATIVE = 'CONSERVATIVE', // Warren Buffett style
  DEGEN = 'DEGEN', // High risk / Crypto Twitter style
  TECHNICAL = 'TECHNICAL', // Chart patterns focus
  QUANT = 'QUANT' // Data driven, neutral
}

export interface AIAnalysisResult {
  markdown: string;
  timestamp: number;
}

export interface PriceAlert {
  coinId: string;
  targetPrice: number;
  isActive: boolean;
}