import React from 'react';
import { X, Bot, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isLoading: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-800/40">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
                    {isLoading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Bot className="w-6 h-6 text-white" />}
                </div>
                <div>
                     <h2 className="text-xl font-bold text-white tracking-tight leading-none mb-1">{title}</h2>
                     <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Relatório de Inteligência Artificial</p>
                </div>
            </div>
          <div className="flex items-center gap-2">
             {!isLoading && (
                 <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                     {copied ? <Check size={20} className="text-emerald-400"/> : <Copy size={20} />}
                 </button>
             )}
             <button 
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
                <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-slate-300">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-6">
              <div className="relative">
                 <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
                 <Sparkles className="w-16 h-16 text-indigo-400 relative z-10 animate-bounce-slow" />
              </div>
              <div className="text-center space-y-2">
                  <p className="text-lg font-medium text-white">Analisando dados do mercado...</p>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">Nossos modelos estão processando tendências, sentimento e indicadores técnicos.</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert prose-slate max-w-none prose-headings:text-indigo-200 prose-a:text-indigo-400 prose-strong:text-white prose-li:marker:text-indigo-500">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-950/30 text-center backdrop-blur-sm">
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
            Isenção de responsabilidade: Análise gerada por IA. Não constitui recomendação de investimento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;