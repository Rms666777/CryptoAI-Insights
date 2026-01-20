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
    <div className="min-h-screen bg-slate-950 font-inter pb-safe">
      
      {/* Top Navigation (Desktop) */}
      <nav className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
              <div className="bg-indigo-600 p-2 rounded-lg"><Cpu className="text-white w-5 h-5" /></div>
              <span className="text-xl font-bold text-white">CryptoAI</span>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
                    <User size={16} /> {currentPersona}
                    <Settings size={16} />
                </button>
                <div className="h-6 w-px bg-slate-800"></div>
                <button onClick={() => setCurrentPage('dashboard')} className={`text-sm ${currentPage === 'dashboard' ? 'text-indigo-400' : 'text-slate-400'}`}>Mercado</button>
                <button onClick={() => setCurrentPage('history')} className={`text-sm ${currentPage === 'history' ? 'text-indigo-400' : 'text-slate-400'}`}>Histórico</button>
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
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 md:hidden z-40 pb-safe">
        <div className="flex justify-around items-center h-16">
            <button onClick={() => setCurrentPage('dashboard')} className={`flex flex-col items-center gap-1 ${currentPage === 'dashboard' ? 'text-indigo-500' : 'text-slate-500'}`}>
                <LayoutDashboard size={20} />
                <span className="text-[10px] font-medium">Mercado</span>
            </button>
            <button onClick={() => setCurrentPage('history')} className={`flex flex-col items-center gap-1 ${currentPage === 'history' ? 'text-indigo-500' : 'text-slate-500'}`}>
                <History size={20} />
                <span className="text-[10px] font-medium">Histórico</span>
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-500">
                <Settings size={20} />
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
      />
    </div>
  );
};

export default App;