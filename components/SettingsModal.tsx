import React, { useState } from 'react';
import { X, Settings, Check, AlertCircle, UserCheck } from 'lucide-react';
import { AIPersona } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: string;
  onSaveModel: (model: string) => void;
  currentPersona: AIPersona;
  onSavePersona: (persona: AIPersona) => void;
}

const POPULAR_MODELS = [
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Grátis)', label: 'Rápido' },
  { id: 'meta-llama/llama-3-8b-instruct:free', name: 'Llama 3 8B (Grátis)', label: 'Meta' },
  { id: 'google/gemma-7b-it:free', name: 'Gemma 7B (Grátis)', label: 'Google' },
];

const PERSONAS = [
    { id: AIPersona.QUANT, name: 'Analista Quant', desc: 'Neutro, baseado em dados' },
    { id: AIPersona.CONSERVATIVE, name: 'Conservador', desc: 'Foco em segurança/longo prazo' },
    { id: AIPersona.TECHNICAL, name: 'Técnico', desc: 'Foco em suportes e resistências' },
    { id: AIPersona.DEGEN, name: 'Degen (Agressivo)', desc: 'Alto risco, foco em hype' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, currentModel, onSaveModel, currentPersona, onSavePersona 
}) => {
  const [tempModel, setTempModel] = useState(currentModel);
  const [tempPersona, setTempPersona] = useState(currentPersona);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveModel(tempModel);
    onSavePersona(tempPersona);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" /> Configurações
            </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
            
            {/* Persona Section */}
            <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-400" /> Personalidade da IA
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

            {/* Model Section */}
            <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-400" /> Modelo OpenRouter
                </h3>
                <input 
                    type="text" 
                    value={tempModel}
                    onChange={(e) => setTempModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-mono mb-3"
                />
                <div className="grid grid-cols-3 gap-2">
                    {POPULAR_MODELS.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => setTempModel(model.id)}
                            className={`text-xs p-2 rounded border truncate ${
                                tempModel === model.id ? 'bg-slate-700 text-white border-slate-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                        >
                            {model.name}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">Usado apenas nos modos OpenRouter ou Híbrido.</p>
            </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-xl flex justify-end gap-3 shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white text-sm">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20">
                Salvar
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;