import React, { useState } from 'react';
import { X, Settings, Check, AlertCircle, UserCheck, Network, Cpu } from 'lucide-react';
import { AIPersona, AIProvider } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: string;
  onSaveModel: (model: string) => void;
  currentPersona: AIPersona;
  onSavePersona: (persona: AIPersona) => void;
  currentProvider: AIProvider;
  onSaveProvider: (provider: AIProvider) => void;
}

const POPULAR_MODELS = [
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', label: 'Standard' },
  { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', label: 'Advanced' },
  { id: 'meta-llama/llama-3-8b-instruct:free', name: 'Llama 3 8B (Free)', label: 'Meta' },
  { id: 'microsoft/phi-3-medium-128k-instruct:free', name: 'Phi-3 Medium', label: 'Microsoft' },
  { id: 'google/gemma-7b-it:free', name: 'Gemma 7B (Free)', label: 'Google' },
  { id: 'nousresearch/nous-capybara-7b:free', name: 'Capybara 7B', label: 'Nous' },
];

const PERSONAS = [
    { id: AIPersona.QUANT, name: 'Analista Quant', desc: 'Neutro, baseado em dados' },
    { id: AIPersona.CONSERVATIVE, name: 'Conservador', desc: 'Foco em segurança/longo prazo' },
    { id: AIPersona.TECHNICAL, name: 'Técnico', desc: 'Foco em suportes e resistências' },
    { id: AIPersona.DEGEN, name: 'Degen (Agressivo)', desc: 'Alto risco, foco em hype' },
];

const PROVIDERS = [
    { id: AIProvider.GEMINI, name: 'Google Gemini', desc: 'Rápido e Preciso (Padrão)', icon: <Cpu size={16}/> },
    { id: AIProvider.OPENROUTER, name: 'OpenRouter', desc: 'Modelos de código aberto (Llama, Mistral)', icon: <Network size={16}/> },
    { id: AIProvider.HYBRID, name: 'Híbrido', desc: 'Combina Gemini + OpenRouter (Mais lento)', icon: <Settings size={16}/> },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, 
    currentModel, onSaveModel, 
    currentPersona, onSavePersona,
    currentProvider, onSaveProvider
}) => {
  const [tempModel, setTempModel] = useState(currentModel);
  const [tempPersona, setTempPersona] = useState(currentPersona);
  const [tempProvider, setTempProvider] = useState(currentProvider);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveModel(tempModel);
    onSavePersona(tempPersona);
    onSaveProvider(tempProvider);
    onClose();
  };

  const showOpenRouterSettings = tempProvider === AIProvider.OPENROUTER || tempProvider === AIProvider.HYBRID;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" /> Configurações Avançadas
            </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
            
            {/* Provider Section */}
            <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-400" /> Provedor de Inteligência
                </h3>
                <div className="space-y-2">
                    {PROVIDERS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setTempProvider(p.id)}
                            className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                                tempProvider === p.id 
                                ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500' 
                                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                            }`}
                        >
                            <div className={`p-2 rounded-md ${tempProvider === p.id ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                {p.icon}
                            </div>
                            <div>
                                <div className={`font-medium ${tempProvider === p.id ? 'text-white' : 'text-slate-300'}`}>{p.name}</div>
                                <div className="text-xs text-slate-500">{p.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Persona Section */}
            <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-400" /> Personalidade do Analista
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PERSONAS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setTempPersona(p.id)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                                tempPersona === p.id 
                                ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500' 
                                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                            }`}
                        >
                            <div className={`font-medium ${tempPersona === p.id ? 'text-white' : 'text-slate-300'}`}>{p.name}</div>
                            <div className="text-xs text-slate-500">{p.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Model Section (Conditional) */}
            {showOpenRouterSettings && (
                <div className="animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-indigo-400" /> Modelo OpenRouter Específico
                    </h3>
                    <input 
                        type="text" 
                        value={tempModel}
                        onChange={(e) => setTempModel(e.target.value)}
                        placeholder="ex: openai/gpt-3.5-turbo"
                        className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-mono mb-3"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        {POPULAR_MODELS.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => setTempModel(model.id)}
                                className={`text-xs p-2 rounded border truncate text-left ${
                                    tempModel === model.id ? 'bg-slate-700 text-white border-slate-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                            >
                                <span className="block font-bold">{model.name}</span>
                                <span className="text-[10px] opacity-70">{model.id}</span>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Selecione um modelo da lista ou digite o ID do OpenRouter.</p>
                </div>
            )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-xl flex justify-end gap-3 shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white text-sm">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20">
                Salvar Configurações
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;