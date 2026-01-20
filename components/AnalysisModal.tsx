import React from 'react';
import { X, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isLoading: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50 rounded-t-xl">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Bot className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-slate-300 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="text-slate-400 animate-pulse">A IA está analisando o mercado...</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-slate max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-xl text-center">
          <p className="text-xs text-slate-500">
            Isenção de responsabilidade: Esta análise é gerada por IA e não constitui aconselhamento financeiro.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
