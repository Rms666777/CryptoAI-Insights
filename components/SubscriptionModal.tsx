import React, { useState } from 'react';
import { X, Check, Crown, CreditCard, QrCode, ShieldCheck, Loader2, Zap } from 'lucide-react';
import { upgradeToPro } from '../services/userService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'PIX'>('CARD');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'PLAN' | 'PAYMENT' | 'SUCCESS'>('PLAN');

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setIsLoading(true);
    // Simulating Payment Gateway Processing (Stripe/PagSeguro)
    setTimeout(() => {
      upgradeToPro();
      setIsLoading(false);
      setStep('SUCCESS');
      setTimeout(() => {
          onSuccess();
          onClose();
      }, 2000);
    }, 2500);
  };

  const renderContent = () => {
    if (step === 'SUCCESS') {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Assinatura Confirmada!</h2>
                <p className="text-slate-400">Bem-vindo ao CryptoAI Pro. Você agora tem acesso ilimitado.</p>
            </div>
        )
    }

    if (step === 'PAYMENT') {
        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={() => setPaymentMethod('CARD')}
                        className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CARD' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                    >
                        <CreditCard size={24} />
                        <span className="text-sm font-bold">Cartão</span>
                    </button>
                    <button 
                        onClick={() => setPaymentMethod('PIX')}
                        className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'PIX' ? 'bg-emerald-600/20 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                    >
                        <QrCode size={24} />
                        <span className="text-sm font-bold">Pix</span>
                    </button>
                </div>

                {paymentMethod === 'CARD' ? (
                    <div className="space-y-4">
                        <input type="text" placeholder="Número do Cartão" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500" />
                        <div className="flex gap-4">
                            <input type="text" placeholder="MM/AA" className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500" />
                            <input type="text" placeholder="CVC" className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500" />
                        </div>
                        <input type="text" placeholder="Nome no Cartão" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500" />
                    </div>
                ) : (
                    <div className="text-center p-6 bg-white rounded-lg">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Pix" className="w-48 h-48 mx-auto opacity-80" />
                        <p className="text-slate-900 text-sm mt-2 font-mono">00020126360014BR.GOV.BCB.PIX...</p>
                    </div>
                )}

                <button 
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : (
                        <>
                            <ShieldCheck size={20} /> Pagar R$ 20,00 e Ativar
                        </>
                    )}
                </button>
                <p className="text-center text-[10px] text-slate-500">Pagamento processado via conexão segura SSL.</p>
            </div>
        );
    }

    // Default: PLAN view
    return (
        <div className="space-y-6 animate-in slide-in-from-left duration-300">
             <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                <h3 className="text-xl font-bold text-white mb-2">Plano Pro Mensal</h3>
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-white">R$ 20</span>
                    <span className="text-slate-400 text-sm">/mês</span>
                </div>
                <ul className="space-y-3 mb-2">
                    {[
                        "Análises ilimitadas com IA",
                        "Acesso aos modelos OpenRouter (Llama 3, Mixtral)",
                        "Alertas de preço ilimitados",
                        "Estratégias de investimento avançadas"
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                            <Check size={16} className="text-emerald-400 shrink-0" /> {item}
                        </li>
                    ))}
                </ul>
             </div>

             <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                 <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
                     <span>Seu limite gratuito</span>
                     <span className="text-rose-400 font-bold">Esgotado</span>
                 </div>
                 <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                     <div className="h-full bg-rose-500 w-full"></div>
                 </div>
             </div>

             <button 
                onClick={() => setStep('PAYMENT')}
                className="w-full py-4 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
                Assinar Agora <Zap size={20} className="fill-indigo-600 text-indigo-600" />
            </button>
             <button onClick={onClose} className="w-full py-2 text-slate-500 text-sm hover:text-white">Agora não</button>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 p-6 pb-8 text-center relative border-b border-slate-800">
            <div className="absolute top-4 right-4">
                <button onClick={onClose} className="p-2 text-slate-500 hover:text-white bg-slate-800 rounded-full"><X size={16}/></button>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 transform rotate-3">
                <Crown className="text-white w-8 h-8 fill-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Libere o Poder da IA</h2>
            <p className="text-slate-400 text-sm">Atualize para o plano Pro e invista melhor.</p>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;