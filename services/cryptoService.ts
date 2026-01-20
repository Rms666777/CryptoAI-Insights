import { CoinData } from '../types';

// Using CoinGecko Public API
// Note: Public API has rate limits (approx 10-30 calls/minute)
const BASE_URL = 'https://api.coingecko.com/api/v3';

export const getTopCoins = async (currency: string = 'usd', perPage: number = 20): Promise<CoinData[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=true&price_change_percentage=24h,7d`
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment.");
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as CoinData[];
  } catch (error) {
    console.error("Failed to fetch crypto data:", error);
    throw error;
  }
};
