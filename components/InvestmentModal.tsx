import React, { useState, useEffect } from 'react';
import { X, Wallet, ArrowRightLeft, DollarSign, Calculator, TrendingUp } from 'lucide-react';
import { CoinData } from '../types';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: CoinData | null;
}

type Mode = 'BUY' | 'SELL';
type Currency = 'USD' | 'BRL';

const BRL_RATE = 5.75; // Taxa fixa para simulação

const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose, coin }) => {
  const [amount, setAmount] = useState<string>('100');
  const [mode, setMode] = useState<Mode>('BUY');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    if (isOpen && coin) {
      calculate();
    }
  }, [amount, mode, currency, coin, isOpen]);

  if (!isOpen || !coin) return null;

  const currentPriceUSD = coin.current_price;
  const currentPrice = currency === 'BRL' ? currentPriceUSD * BRL_RATE : currentPriceUSD;

  const calculate = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setResult(0);
      return;
    }

    if (mode === 'BUY') {
      // Entra Dinheiro (Fiat) -> Sai Crypto
      setResult(val / currentPrice);
    } else {
      // Entra Crypto -> Sai Dinheiro (Fiat)
      setResult(val * currentPrice);
    }
  };

  const handleClose = () => {
    setAmount('100');
    setMode('BUY');
    onClose();
  };

  const setPercentage = (pct: number) => {
      // Simulation logic just for UX demo
      const base = mode === 'BUY' ? 1000 : 1; // Simulated balance
      setAmount((base * pct).toString());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${mode === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Simulador</h2>
              <p className="text-xs text-slate-400 font-medium">Negociando {coin.name}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Toggle Mode */}
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button 
              onClick={() => setMode('BUY')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${mode === 'BUY' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'text-slate-400 hover:text-white'}`}
            >
              Comprar
            </button>
            <button 
              onClick={() => setMode('SELL')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${mode === 'SELL' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50' : 'text-slate-400 hover:text-white'}`}
            >
              Vender
            </button>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {mode === 'BUY' ? 'Você Paga' : 'Você Vende'}
                 </label>
                 <div className="flex gap-2">
                    {[0.25, 0.5, 1].map(pct => (
                        <button key={pct} onClick={() => setPercentage(pct)} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition-colors">
                            {pct * 100}%
                        </button>
                    ))}
                 </div>
              </div>
              
              <div className="relative group">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white pl-4 pr-24 py-4 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-2xl font-mono font-bold transition-all group-hover:border-slate-600"
                  placeholder="0.00"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {mode === 'BUY' ? (
                     <select 
                       value={currency} 
                       onChange={(e) => setCurrency(e.target.value as Currency)}
                       className="bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-lg border border-slate-700 focus:ring-0 cursor-pointer hover:bg-slate-700 transition-colors"
                     >
                       <option value="USD">USD</option>
                       <option value="BRL">BRL</option>
                     </select>
                  ) : (
                    <span className="bg-slate-800 border border-slate-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-2">
                       <img src={coin.image} className="w-4 h-4 rounded-full"/> {coin.symbol.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-2 relative z-10">
               <div className="bg-slate-800 p-2 rounded-full border border-slate-700 text-slate-400">
                  <ArrowRightLeft className="w-4 h-4 rotate-90" />
               </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
                {mode === 'BUY' ? 'Você Recebe (Estimado)' : 'Você Recebe (Estimado)'}
              </label>
              <div className="relative">
                <div className={`w-full bg-slate-800/50 border border-slate-700/50 pl-4 pr-20 py-4 rounded-xl text-2xl font-mono font-bold ${mode === 'BUY' ? 'text-emerald-400' : 'text-white'}`}>
                  {mode === 'BUY' 
                    ? result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) 
                    : result.toLocaleString(undefined, { style: 'currency', currency: currency })
                  }
                </div>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <span className="text-slate-500 text-sm font-bold">
                      {mode === 'BUY' ? coin.symbol.toUpperCase() : currency}
                   </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-4 flex justify-between items-center">
            <div className="text-xs text-indigo-300">
                <span className="block opacity-70">Preço de Mercado</span>
                <span className="font-mono font-bold text-sm">
                    {currentPrice.toLocaleString(undefined, { style: 'currency', currency: currency })}
                </span>
            </div>
            {currency === 'BRL' && (
                <div className="text-right text-xs text-slate-400">
                  <span className="block opacity-70">Taxa USD/BRL</span>
                  <span className="font-mono">R$ {BRL_RATE.toFixed(2)}</span>
                </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 rounded-b-xl flex gap-3">
          <button onClick={handleClose} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors">
            Cancelar
          </button>
          <button className={`flex-1 py-3.5 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${mode === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20'}`}>
            <Wallet size={18} />
            {mode === 'BUY' ? 'Confirmar Compra' : 'Confirmar Venda'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestmentModal;