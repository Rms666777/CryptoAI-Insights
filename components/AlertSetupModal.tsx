import React, { useState, useEffect } from 'react';
import { X, Bell, TrendingUp } from 'lucide-react';
import { CoinData, PriceAlert } from '../types';

interface AlertSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: CoinData | null;
  currentAlert: PriceAlert | undefined;
  onSave: (alert: PriceAlert) => void;
  onDelete: (coinId: string) => void;
}

const AlertSetupModal: React.FC<AlertSetupModalProps> = ({ 
  isOpen, onClose, coin, currentAlert, onSave, onDelete 
}) => {
  const [targetPrice, setTargetPrice] = useState<string>('');

  useEffect(() => {
    if (isOpen && coin) {
      setTargetPrice(currentAlert ? currentAlert.targetPrice.toString() : coin.current_price.toString());
    }
  }, [isOpen, coin, currentAlert]);

  if (!isOpen || !coin) return null;

  const handleSave = () => {
    const price = parseFloat(targetPrice);
    if (!isNaN(price) && price > 0) {
      onSave({
        coinId: coin.id,
        targetPrice: price,
        isActive: true
      });
      onClose();
    }
  };

  const handleDelete = () => {
    onDelete(coin.id);
    onClose();
  };

  const percentageDiff = targetPrice ? ((parseFloat(targetPrice) - coin.current_price) / coin.current_price) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Alerta de Preço</h2>
              <p className="text-xs text-slate-400 font-medium">{coin.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Preço Atual</p>
                <p className="text-2xl font-mono font-bold text-white">
                    ${coin.current_price.toLocaleString()}
                </p>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">
                    Me avise quando o preço chegar em:
                </label>
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono">$</span>
                    <input 
                        type="number" 
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white pl-8 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none text-lg font-mono font-bold transition-all"
                        placeholder="0.00"
                    />
                </div>
                {targetPrice && (
                    <div className={`mt-2 text-xs font-medium flex items-center gap-1 ${percentageDiff > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <TrendingUp size={12} className={percentageDiff < 0 ? 'rotate-180' : ''} />
                        {percentageDiff > 0 ? '+' : ''}{percentageDiff.toFixed(2)}% do preço atual
                    </div>
                )}
            </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/80 rounded-b-xl flex gap-3">
          {currentAlert && (
              <button onClick={handleDelete} className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-sm font-semibold transition-colors">
                Remover
              </button>
          )}
          <button 
            onClick={handleSave} 
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Bell size={18} fill="currentColor" />
            {currentAlert ? 'Atualizar Alerta' : 'Criar Alerta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertSetupModal;