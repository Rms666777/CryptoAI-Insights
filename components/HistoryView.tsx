import React, { useState, useEffect } from 'react';
import { getUserHistory, deleteHistoryItem, HistoricalAnalysis } from '../services/geminiService';
import { Trash2, Search, Calendar, Cpu, ExternalLink, Filter, DollarSign } from 'lucide-react';

interface HistoryViewProps {
  onViewAnalysis: (title: string, content: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onViewAnalysis }) => {
  const [history, setHistory] = useState<HistoricalAnalysis[]>([]);
  const [filterTerm, setFilterTerm] = useState("");
  const [providerFilter, setProviderFilter] = useState("ALL");

  useEffect(() => {
    setHistory(getUserHistory());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('Tem certeza que deseja excluir esta análise do histórico?')) {
        const updated = deleteHistoryItem(id);
        setHistory(updated);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.coinName.toLowerCase().includes(filterTerm.toLowerCase()) || 
                          item.summary.toLowerCase().includes(filterTerm.toLowerCase());
    const matchesProvider = providerFilter === "ALL" || item.provider === providerFilter;
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Histórico</h2>
          <p className="text-slate-400 text-sm">Reveja seus insights passados.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Buscar moeda..." 
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white pl-9 pr-4 py-3 sm:py-2 rounded-xl sm:rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
            </div>
            <select 
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl sm:rounded-lg px-3 py-3 sm:py-2 focus:outline-none w-full sm:w-auto"
            >
                <option value="ALL">Todas IAs</option>
                <option value="GEMINI">Gemini</option>
                <option value="OPENROUTER">OpenRouter</option>
                <option value="HYBRID">Híbrido</option>
            </select>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
          <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300">Nenhum histórico encontrado</h3>
          <p className="text-slate-500">Suas análises aparecerão aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <div 
                key={item.id} 
                onClick={() => onViewAnalysis(item.coinName, item.fullContent)}
                className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-white text-lg">{item.coinName}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-slate-700 text-slate-300">
                          {item.provider}
                      </span>
                      {item.priceAtAnalysis && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                             <DollarSign size={8} /> {item.priceAtAnalysis.toLocaleString()}
                          </span>
                      )}
                    </div>
                </div>
                <button 
                    onClick={(e) => handleDelete(item.id, e)}
                    className="text-slate-500 hover:text-rose-400 p-2 rounded hover:bg-slate-700 transition-colors"
                    title="Excluir"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">
                {item.summary}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-auto">
                <div className="flex items-center text-xs text-slate-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(item.date).toLocaleDateString()}
                    <span className="mx-1">•</span>
                    {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="flex items-center text-indigo-400 text-xs font-medium group-hover:underline">
                    Ver completa <ExternalLink className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;