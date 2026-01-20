import React, { useState, useEffect } from 'react';
import { getTopCoins } from '../services/cryptoService';
import { analyzeMarket, analyzeSpecificCoin } from '../services/geminiService';
import { CoinData, AnalysisType, AIProvider, AIPersona } from '../types';
import CoinRow from './CoinRow';
import InvestmentModal from './InvestmentModal';
import { 
  BarChart3, Calendar, RefreshCcw, AlertTriangle, Search, Zap, 
  TrendingUp, TrendingDown, MinusCircle, Star, Activity, DollarSign
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

    // Handle Deep Link / Shared Link
    const params = new URLSearchParams(window.location.search);
    const sharedCoinId = params.get('coin');
    if (sharedCoinId) {
        setSearchTerm(sharedCoinId);
    }
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
                          c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFav = showFavoritesOnly ? favorites.includes(c.id) : true;
    return matchesSearch && matchesFav;
  });

  // Calculations for Hero Stats
  const globalMarketCap = coins.reduce((acc, c) => acc + c.market_cap, 0);
  const topGainer = [...coins].sort((a,b) => b.price_change_percentage_24h - a.price_change_percentage_24h)[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32">
        
        {/* Header / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Main Welcome Card */}
            <div className="md:col-span-2 bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-bold uppercase tracking-wide">
                            AI Power: {selectedProvider}
                        </span>
                        <span className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-[10px] font-bold uppercase tracking-wide">
                            {currentPersona}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Visão de Mercado</h1>
                    <p className="text-slate-400 text-sm mb-6 max-w-lg">
                        Acesse insights em tempo real gerados por inteligência artificial para tomar decisões mais assertivas.
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => handleGlobalAnalysis(AnalysisType.DAILY)} disabled={loadingData} 
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95">
                            <BarChart3 size={18} /> Resumo Diário
                        </button>
                        <button onClick={() => handleGlobalAnalysis(AnalysisType.WEEKLY)} disabled={loadingData} 
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium border border-slate-700 flex items-center gap-2 transition-all active:scale-95">
                            <Calendar size={18} /> Semanal
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Card */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                 <div className="glass-card rounded-2xl p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Activity size={16} className="text-emerald-400" />
                        <span className="text-xs font-semibold uppercase">Top Mover (24h)</span>
                    </div>
                    {loadingData ? (
                        <div className="h-6 w-24 bg-slate-800 animate-pulse rounded"></div>
                    ) : topGainer ? (
                        <div>
                            <div className="text-lg font-bold text-white">{topGainer.symbol.toUpperCase()}</div>
                            <div className="text-emerald-400 font-mono text-sm">+{topGainer.price_change_percentage_24h?.toFixed(2)}%</div>
                        </div>
                    ) : <span>-</span>}
                 </div>

                 <div className="glass-card rounded-2xl p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <DollarSign size={16} className="text-blue-400" />
                        <span className="text-xs font-semibold uppercase">Market Cap (Top 20)</span>
                    </div>
                     {loadingData ? (
                        <div className="h-6 w-24 bg-slate-800 animate-pulse rounded"></div>
                    ) : (
                        <div className="text-lg font-bold text-white font-mono">
                            ${(globalMarketCap / 1e12).toFixed(2)} T
                        </div>
                    )}
                 </div>
            </div>
        </div>

        {/* Filters */}
        <div className="sticky top-[72px] z-20 bg-slate-950/80 backdrop-blur-xl py-4 mb-2 -mx-4 px-4 border-b border-slate-800/50 md:static md:bg-transparent md:border-none md:p-0 md:mx-0">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                        type="text" placeholder="Buscar criptomoeda (ex: Bitcoin)" 
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700/80 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-sm transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${showFavoritesOnly ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}
                    >
                        <Star size={18} fill={showFavoritesOnly ? "currentColor" : "none"} />
                        <span className="hidden sm:inline text-sm font-medium">Favoritos</span>
                    </button>
                    <button onClick={fetchData} className="p-3 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-xl hover:border-slate-600 transition-all active:scale-95">
                        <RefreshCcw size={18} className={loadingData ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>
        </div>

        {/* List Header (Desktop Only) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-4 pl-2">Ativo</div>
            <div className="col-span-2 text-right">Preço</div>
            <div className="col-span-2 text-right">24h %</div>
            <div className="col-span-2 text-center">Gráfico (7d)</div>
            <div className="col-span-2 text-right pr-2">Ações</div>
        </div>

        {/* List */}
        <div className="space-y-3">
            {loadingData && coins.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-slate-800/30 border border-white/5 rounded-xl animate-pulse"></div>)
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
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-full mb-3">
                         <Search className="w-6 h-6 text-slate-600" />
                    </div>
                    <p className="text-slate-500">
                        {showFavoritesOnly ? "Você ainda não favoritou nenhuma moeda." : "Nenhum ativo encontrado."}
                    </p>
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