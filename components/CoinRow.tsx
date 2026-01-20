import React, { useState } from 'react';
import { CoinData } from '../types';
import CryptoChart from './CryptoChart';
import { TrendingUp, TrendingDown, BrainCircuit, Percent, Share2, Check, Star, Wallet } from 'lucide-react';

interface CoinRowProps {
  coin: CoinData;
  onAnalyze: (coin: CoinData) => void;
  onInvest: (coin: CoinData) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const CoinRow: React.FC<CoinRowProps> = ({ coin, onAnalyze, onInvest, isFavorite, onToggleFavorite }) => {
  const [copied, setCopied] = useState(false);
  const priceChange = coin.price_change_percentage_24h ?? 0;
  const isPositive = priceChange >= 0;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: `Análise: ${coin.name}`,
      text: `${coin.name} ($${coin.symbol.toUpperCase()}) - $${coin.current_price}. Análise CryptoAI.`,
      url: window.location.href
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.debug('Share cancelled'); }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) { console.error('Clipboard failed'); }
    }
  };

  return (
    <div className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Name, Rank, Favorite */}
        <div className="flex items-center gap-3 min-w-[200px] w-full md:w-auto">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(coin.id); }}
            className={`p-1.5 rounded-full transition-colors ${isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <span className="text-slate-500 font-mono text-sm w-6">#{coin.market_cap_rank}</span>
          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
          <div>
            <h3 className="font-bold text-white">{coin.name}</h3>
            <span className="text-xs text-slate-400 uppercase">{coin.symbol}</span>
          </div>
        </div>

        {/* Price Info */}
        <div className="flex items-center gap-8 flex-1 justify-between w-full md:w-auto">
          <div className="text-right">
            <p className="text-slate-400 text-xs mb-1">Preço Atual</p>
            <p className="font-medium text-white">
              ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) ?? '0.00'}
            </p>
          </div>

          <div className="text-right">
            <p className="text-slate-400 text-xs mb-1">24h %</p>
            <div className={`flex items-center justify-end gap-1 font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {priceChange.toFixed(2)}%
            </div>
          </div>
          
          <div className="hidden lg:block text-right">
             <p className="text-slate-400 text-xs mb-1">Mkt Cap</p>
             <p className="text-slate-200 text-sm">${(coin.market_cap / 1e9).toFixed(2)} B</p>
          </div>
        </div>

        {/* Chart */}
        <div className="hidden sm:block">
            {coin.sparkline_in_7d && (
                <CryptoChart 
                    data={coin.sparkline_in_7d.price} 
                    color={isPositive ? '#34d399' : '#fb7185'} 
                />
            )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full md:w-auto">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onInvest(coin);
                }}
                className="px-3 py-2 bg-slate-700 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center justify-center"
                title="Investir / Simular"
            >
                <Wallet size={18} />
            </button>

            <button
                onClick={handleShare}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center justify-center"
            >
                {copied ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
            </button>
            
            <button 
                onClick={(e) => { e.stopPropagation(); onAnalyze(coin); }}
                className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap shadow-lg shadow-indigo-600/20"
            >
                <BrainCircuit size={16} />
                <span className="md:hidden xl:inline">IA Analisar</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default CoinRow;