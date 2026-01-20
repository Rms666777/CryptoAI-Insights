import React, { useState } from 'react';
import { AIProvider, AIPersona } from './types';
import AnalysisModal from './components/AnalysisModal';
import SettingsModal from './components/SettingsModal';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import HistoryView from './components/HistoryView';
import InstallPWA from './components/InstallPWA';
import { Cpu, LayoutDashboard, History, Settings, LogOut, User } from 'lucide-react';

type Page = 'dashboard' | 'history';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  // AI Config
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AIProvider.GEMINI);
  const [openRouterModel, setOpenRouterModel] = useState("mistralai/mistral-7b-instruct:free");
  const [currentPersona, setCurrentPersona] = useState<AIPersona>(AIPersona.QUANT);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [analysisContent, setAnalysisContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleShowModal = (title: string, content: string, isLoading: boolean) => {
      setModalTitle(title);
      setAnalysisContent(content);
      setIsAnalyzing(isLoading);
      setIsModalOpen(true);
  };

  if (!isAuthenticated) return <LoginPage onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="min-h-screen font-sans text-slate-200 pb-safe selection:bg-indigo-500/30">
      
      {/* Top Navigation (Desktop) */}
      <nav className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentPage('dashboard')}>
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform"><Cpu className="text-white w-5 h-5" /></div>
              <span className="text-xl font-bold text-white tracking-tight">CryptoAI</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-full border border-white/5">
                <button 
                    onClick={() => setCurrentPage('dashboard')} 
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currentPage === 'dashboard' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                    Mercado
                </button>
                <button 
                    onClick={() => setCurrentPage('history')} 
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currentPage === 'history' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                    Histórico
                </button>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg transition-all">
                    <User size={14} /> 
                    <span className="uppercase tracking-wide">{currentPersona}</span>
                    <Settings size={14} className="ml-1" />
                </button>
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        {currentPage === 'dashboard' ? (
            <Dashboard 
                selectedProvider={selectedProvider} 
                openRouterModel={openRouterModel}
                currentPersona={currentPersona}
                onShowModal={handleShowModal} 
            />
        ) : (
            <HistoryView onViewAnalysis={(t, c) => handleShowModal(t, c, false)} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 md:hidden z-40 pb-safe">
        <div className="flex justify-around items-center h-16">
            <button onClick={() => setCurrentPage('dashboard')} className={`flex flex-col items-center gap-1 transition-colors ${currentPage === 'dashboard' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <LayoutDashboard size={22} strokeWidth={currentPage === 'dashboard' ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Mercado</span>
            </button>
            <button onClick={() => setCurrentPage('history')} className={`flex flex-col items-center gap-1 transition-colors ${currentPage === 'history' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <History size={22} strokeWidth={currentPage === 'history' ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Histórico</span>
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-400 transition-colors">
                <Settings size={22} />
                <span className="text-[10px] font-medium">Config</span>
            </button>
        </div>
      </div>

      <InstallPWA />

      <AnalysisModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={modalTitle} content={analysisContent} isLoading={isAnalyzing}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        currentModel={openRouterModel} onSaveModel={setOpenRouterModel}
        currentPersona={currentPersona} onSavePersona={setCurrentPersona}
        currentProvider={selectedProvider} onSaveProvider={setSelectedProvider}
      />
    </div>
  );
};

export default App;