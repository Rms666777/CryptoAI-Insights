import React, { useState, useEffect } from 'react';
import { getTopCoins } from '../services/cryptoService';
import { analyzeMarket, analyzeSpecificCoin } from '../services/geminiService';
import { CoinData, AnalysisType, AIProvider, AIPersona } from '../types';
import CoinRow from './CoinRow';
import InvestmentModal from './InvestmentModal';
import { 
  BarChart3, Calendar, RefreshCcw, AlertTriangle, Search, Zap, 
  TrendingUp, TrendingDown, MinusCircle, Star
} from 'lucide-react';

interface DashboardProps {
    selectedProvider: AIProvider;
    openRouterModel: string;
    currentPersona: AIPersona;
    onShowModal: (title: string, content: string, isLoading: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ selectedProvider, openRouterModel, currentPersona, onShowModal }) => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Investment Modal State
  const [investmentCoin, setInvestmentCoin] = useState<CoinData | null>(null);

  useEffect(() => {
    fetchData();
    const savedFavs = localStorage.getItem('crypto_favs');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('crypto_favs', JSON.stringify(newFavs));
  };

  const fetchData = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const data = await getTopCoins();
      setCoins(data);
    } catch (err) {
      setError("Falha ao carregar dados. Verifique a conexão.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleGlobalAnalysis = async (type: AnalysisType) => {
    const title = `Análise de Mercado (${currentPersona})`;
    onShowModal(title, "", true);
    const result = await analyzeMarket(coins, type, selectedProvider, openRouterModel, currentPersona);
    onShowModal(title, result, false);
  };

  const handleCoinAnalysis = async (coin: CoinData) => {
    const title = `Análise: ${coin.name} (${currentPersona})`;
    onShowModal(title, "", true);
    const result = await analyzeSpecificCoin(coin, selectedProvider, openRouterModel, currentPersona);
    onShowModal(title, result, false);
  };

  const filteredCoins = coins.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFav = showFavoritesOnly ? favorites.includes(c.id) : true;
    return matchesSearch && matchesFav;
  });

  const averageChange = coins.length > 0 ? coins.reduce((acc, c) => acc + (c.price_change_percentage_24h || 0), 0) / coins.length : 0;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-900/60 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">CryptoAI Insight</h1>
            <p className="text-slate-300 text-sm sm:text-base mb-6 max-w-xl">
               Análise avançada via <strong>{selectedProvider}</strong> com perfil <strong>{currentPersona}</strong>.
            </p>
            
            <div className="flex flex-wrap gap-3">
                <button onClick={() => handleGlobalAnalysis(AnalysisType.DAILY)} disabled={loadingData} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/30 flex items-center gap-2">
                    <BarChart3 size={18} /> Análise Diária
                </button>
                <button onClick={() => handleGlobalAnalysis(AnalysisType.WEEKLY)} disabled={loadingData} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                    <Calendar size={18} /> Semanal
                </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text" placeholder="Buscar criptomoeda..." 
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white pl-9 pr-4 py-3 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                />
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-colors ${showFavoritesOnly ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                >
                    <Star size={18} fill={showFavoritesOnly ? "currentColor" : "none"} />
                    <span className="hidden sm:inline">Favoritos</span>
                </button>
                <button onClick={fetchData} className="p-3 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl">
                    <RefreshCcw size={18} className={loadingData ? 'animate-spin' : ''} />
                </button>
            </div>
        </div>

        {/* List */}
        <div className="space-y-3">
            {loadingData && coins.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-slate-800/50 rounded-xl animate-pulse"></div>)
            ) : filteredCoins.length > 0 ? (
                filteredCoins.map(coin => (
                    <CoinRow 
                        key={coin.id} coin={coin} 
                        onAnalyze={handleCoinAnalysis} 
                        onInvest={setInvestmentCoin}
                        isFavorite={favorites.includes(coin.id)} onToggleFavorite={toggleFavorite}
                    />
                ))
            ) : (
                <div className="text-center py-12 text-slate-500">
                    {showFavoritesOnly ? "Nenhum favorito adicionado." : "Nenhuma moeda encontrada."}
                </div>
            )}
        </div>

        {/* Investment Simulation Modal */}
        <InvestmentModal 
            isOpen={!!investmentCoin} 
            onClose={() => setInvestmentCoin(null)} 
            coin={investmentCoin} 
        />
    </div>
  );
};

export default Dashboard;