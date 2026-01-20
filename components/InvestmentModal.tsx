import React, { useState, useEffect } from 'react';
import { X, Wallet, ArrowRightLeft, DollarSign, Calculator } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-800/30 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Calculator className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Simulador</h2>
              <p className="text-xs text-slate-400">Investimento em {coin.name}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Toggle Mode */}
          <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setMode('BUY')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === 'BUY' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Comprar
            </button>
            <button 
              onClick={() => setMode('SELL')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === 'SELL' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Vender
            </button>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">
                {mode === 'BUY' ? 'Eu quero investir' : 'Eu quero vender'}
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white pl-4 pr-20 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-mono"
                  placeholder="0.00"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {mode === 'BUY' ? (
                     <select 
                       value={currency} 
                       onChange={(e) => setCurrency(e.target.value as Currency)}
                       className="bg-slate-700 text-white text-xs font-bold py-1.5 px-2 rounded-lg border-none focus:ring-0 cursor-pointer"
                     >
                       <option value="USD">USD</option>
                       <option value="BRL">BRL</option>
                     </select>
                  ) : (
                    <span className="bg-slate-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg">
                      {coin.symbol.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
               <ArrowRightLeft className="text-slate-600 w-5 h-5 rotate-90" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">
                {mode === 'BUY' ? 'Eu recebo (estimado)' : 'Eu recebo (estimado)'}
              </label>
              <div className="relative">
                <div className="w-full bg-slate-900/50 border border-slate-700/50 text-emerald-400 pl-4 pr-16 py-3 rounded-xl text-lg font-mono font-bold">
                  {mode === 'BUY' 
                    ? result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }) 
                    : result.toLocaleString(undefined, { style: 'currency', currency: currency })
                  }
                </div>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2">
                   <span className="text-slate-500 text-xs font-bold">
                      {mode === 'BUY' ? coin.symbol.toUpperCase() : currency}
                   </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Preço Atual ({currency}):</span>
              <span className="text-slate-300 font-mono">
                {currentPrice.toLocaleString(undefined, { style: 'currency', currency: currency })}
              </span>
            </div>
            {currency === 'BRL' && (
                <div className="flex justify-between text-slate-500">
                  <span>Cotação USD/BRL (Ref):</span>
                  <span>R$ {BRL_RATE.toFixed(2)}</span>
                </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-xl flex gap-3">
          <button onClick={handleClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
            Cancelar
          </button>
          <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
            <Wallet size={16} />
            {mode === 'BUY' ? 'Simular Compra' : 'Simular Venda'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestmentModal;