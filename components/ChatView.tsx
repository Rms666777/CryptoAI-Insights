import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, TrendingUp, HelpCircle, GraduationCap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';
import { canUseAI, incrementUsage } from '../services/userService';
import SubscriptionModal from './SubscriptionModal';

const SUGGESTIONS = [
  { icon: <BookOpen size={16}/>, text: "O que é Bitcoin?" },
  { icon: <TrendingUp size={16}/>, text: "Como funciona o Halving?" },
  { icon: <HelpCircle size={16}/>, text: "Diferença entre PoW e PoS?" },
  { icon: <Sparkles size={16}/>, text: "O que são NFTs?" },
];

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: 'Olá! Sou seu **CryptoMentor**. \n\nEstou aqui para tirar suas dúvidas sobre o mercado, explicar conceitos técnicos ou discutir tendências. \n\nO que você gostaria de aprender hoje?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    // Check usage limit
    if (!canUseAI()) {
        setShowSubscription(true);
        return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // API Call
      const responseText = await sendChatMessage(messages, text);
      
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        text: responseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);
      incrementUsage(); // Count usage
    } catch (error) {
       const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        text: "Desculpe, tive um problema ao processar sua resposta. Tente novamente.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] max-w-4xl mx-auto">
        <SubscriptionModal isOpen={showSubscription} onClose={() => setShowSubscription(false)} onSuccess={() => setShowSubscription(false)} />
        
        {/* Header Area for context */}
        <div className="px-4 py-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wide mb-2">
                <GraduationCap size={14} /> Modo Educacional
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar pb-4">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20' : 'bg-slate-700'}`}>
                        {msg.role === 'ai' ? <Bot size={16} className="text-white"/> : <User size={16} className="text-slate-300"/>}
                    </div>
                    
                    <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-slate-800 text-white rounded-tr-none border border-slate-700' 
                            : 'glass-panel text-slate-200 rounded-tl-none'
                        }`}>
                            {msg.role === 'ai' ? (
                                <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-indigo-300 prose-a:text-indigo-400 prose-code:bg-slate-900 prose-code:px-1 prose-code:rounded">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            ) : (
                                msg.text
                            )}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </div>
            ))}
            
            {isLoading && (
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-white"/>
                    </div>
                    <div className="glass-panel px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/50">
             {/* Suggestions (only if few messages) */}
             {messages.length < 3 && (
                <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-2">
                    {SUGGESTIONS.map((s, i) => (
                        <button 
                            key={i}
                            onClick={() => handleSend(s.text)}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 rounded-xl text-xs text-slate-400 hover:text-white transition-all whitespace-nowrap"
                        >
                            {s.icon} {s.text}
                        </button>
                    ))}
                </div>
            )}

            <div className="relative max-w-4xl mx-auto">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Pergunte sobre criptomoedas, mercado ou tecnologia..."
                    className="w-full bg-slate-900 border border-slate-700 text-white pl-4 pr-12 py-4 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none shadow-lg"
                    disabled={isLoading}
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={18} />
                </button>
            </div>
            <p className="text-center text-[10px] text-slate-600 mt-2">
                O CryptoMentor pode cometer erros. Verifique informações importantes.
            </p>
        </div>
    </div>
  );
};

export default ChatView;