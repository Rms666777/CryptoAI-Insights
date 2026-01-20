import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsVisible(false);
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:w-96 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-slate-800 border border-indigo-500/50 p-4 rounded-xl shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Download className="text-white w-5 h-5" />
            </div>
            <div>
                <p className="text-white font-medium text-sm">Instalar Aplicativo</p>
                <p className="text-slate-400 text-xs">Acesso rápido e offline</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsVisible(false)} className="p-2 text-slate-400 hover:text-white"><X size={18}/></button>
            <button onClick={handleInstall} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">Instalar</button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;