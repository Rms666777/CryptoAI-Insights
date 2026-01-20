import React, { useState } from 'react';
import { CoinData, PriceAlert } from '../types';
import CryptoChart from './CryptoChart';
import { TrendingUp, TrendingDown, BrainCircuit, Percent, Share2, Check, Star, Wallet, ArrowRight, Bell, Zap, Trophy } from 'lucide-react';

interface CoinRowProps {
  coin: CoinData;
  onAnalyze: (coin: CoinData) => void;
  onInvest: (coin: CoinData) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  alert: PriceAlert | undefined;
  onSetAlert: (coin: CoinData) => void;
}

const CoinRow: React.FC<CoinRowProps> = ({ 
    coin, onAnalyze, onInvest, 
    isFavorite, onToggleFavorite,
    alert, onSetAlert
}) => {
  const [copied, setCopied] = useState(false);
  const priceChange = coin.price_change_percentage_24h ?? 0;
  const isPositive = priceChange >= 0;

  // Logic to determine if "Significant AI Analysis" is likely available
  // If volatility is high (> 3% or < -3%), suggest AI check
  const hasSignificantInsight = Math.abs(priceChange) > 3;

  // Logic to determine if alert is "triggered" (visual indication)
  // Simple approximation: if price is very close to target (within 0.5%)
  const isAlertTriggered = alert && Math.abs((coin.current_price - alert.targetPrice) / alert.targetPrice) < 0.005;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Construct a URL that triggers the search for this coin
    const url = new URL(window.location.href);
    url.searchParams.set('coin', coin.id);
    const shareUrl = url.toString();

    const shareData = {
      title: `Análise CryptoAI: ${coin.name}`,
      text: `Confira a análise de IA para ${coin.name} ($${coin.symbol.toUpperCase()}). Preço: $${coin.current_price}.`,
      url: shareUrl
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
    <div className={`group glass-card hover:bg-slate-800/80 rounded-xl p-4 transition-all duration-200 border ${isAlertTriggered ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-slate-700/30'} hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 relative overflow-hidden`}>
      
      {/* Significant Insight Glow Background */}
      {hasSignificantInsight && (
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative z-10">
        
        {/* Mobile Header: Name & Price */}
        <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-3">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(coin.id); }}
                    className={`p-2 -ml-2 rounded-full transition-colors ${isFavorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'}`}
                >
                    <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
                </button>
                <div className="relative">
                    <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full bg-white/5 p-0.5" />
                    <div className="absolute -bottom-1 -right-1 bg-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">
                        #{coin.market_cap_rank}
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-white text-base leading-tight flex items-center gap-2">
                        {coin.name}
                        {isAlertTriggered && <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{coin.symbol}</span>
                        {coin.roi && (
                             <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono font-bold border border-amber-500/20 md:hidden" title="ROI (Retorno sobre Investimento)">
                                <Trophy size={8} /> {coin.roi.times.toFixed(1)}x
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Mobile Only Price */}
            <div className="md:hidden text-right">
                <p className="font-bold text-white font-mono text-base">
                  ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </p>
                <div className={`flex items-center justify-end gap-1 text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                   {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </div>
            </div>
        </div>

        {/* Desktop Price */}
        <div className="hidden md:block col-span-2 text-right">
            <p className="font-bold text-white font-mono tracking-tight">
              ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) ?? '0.00'}
            </p>
            {alert && (
                <div className="text-[10px] text-slate-500 font-mono flex items-center justify-end gap-1">
                    <Bell size={10} className={isAlertTriggered ? "text-amber-500 animate-bounce" : ""} /> 
                    Alvo: ${alert.targetPrice.toLocaleString()}
                </div>
            )}
        </div>

        {/* Desktop Change & ROI */}
        <div className="hidden md:flex flex-col items-end col-span-2 text-right">
             <div className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(priceChange).toFixed(2)}%
            </div>
            {coin.roi && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-500 font-mono font-bold opacity-80" title={`Retorno sobre Investimento (${coin.roi.currency.toUpperCase()})`}>
                    <Trophy size={10} />
                    ROI: +{coin.roi.percentage.toLocaleString(undefined, {maximumFractionDigits: 0})}% ({coin.roi.times.toFixed(2)}x)
                </div>
            )}
        </div>

        {/* Chart */}
        <div className="col-span-12 md:col-span-2 h-12 flex justify-center md:justify-center items-center opacity-70 group-hover:opacity-100 transition-opacity">
            {coin.sparkline_in_7d && (
                <div className="w-full h-full max-w-[120px]">
                    <CryptoChart 
                        data={coin.sparkline_in_7d.price} 
                        color={isPositive ? '#34d399' : '#fb7185'} 
                    />
                </div>
            )}
        </div>

        {/* Actions */}
        <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2 pt-2 md:pt-0 border-t border-slate-800 md:border-t-0">
            
            <button
                onClick={(e) => { e.stopPropagation(); onSetAlert(coin); }}
                className={`p-2.5 rounded-xl transition-all border ${alert ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'}`}
                title="Configurar Alerta"
            >
                <Bell size={18} fill={alert ? "currentColor" : "none"} className={isAlertTriggered ? 'animate-shake' : ''} />
            </button>

            <button
                onClick={(e) => { e.stopPropagation(); onInvest(coin); }}
                className="p-2.5 bg-slate-800/50 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/50 rounded-xl transition-all"
                title="Investir"
            >
                <Wallet size={18} />
            </button>

            <button
                onClick={handleShare}
                className="p-2.5 bg-slate-800/50 hover:bg-sky-500/20 text-slate-400 hover:text-sky-400 border border-slate-700 hover:border-sky-500/50 rounded-xl transition-all"
                title="Copiar Link de Análise"
            >
                {copied ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
            </button>
            
            <button 
                onClick={(e) => { e.stopPropagation(); onAnalyze(coin); }}
                className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm font-semibold active:scale-95 group/btn relative overflow-hidden ${hasSignificantInsight ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/40 ring-1 ring-indigo-400 border-indigo-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'}`}
            >
                 {hasSignificantInsight && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></span>
                 )}
                {hasSignificantInsight ? <Zap size={18} fill="currentColor" /> : <BrainCircuit size={18} />}
                <span className="md:hidden xl:inline">IA</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default CoinRow;