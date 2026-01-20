import { GoogleGenAI } from "@google/genai";
import { CoinData, AnalysisType, AIProvider, AIPersona, ChatMessage } from '../types';
import { getCurrentUserEmail } from './userService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// Configured Key for the project
const OPENROUTER_API_KEY = "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";

// --- CACHE & HISTORY CONFIGURATION ---
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes cache for specific coin analysis
// Note: HISTORY_STORAGE_KEY is now dynamic based on user

interface CacheEntry {
  content: string;
  timestamp: number;
  provider: AIProvider;
  persona: AIPersona;
}

// In-memory cache for current session
const analysisCache = new Map<string, CacheEntry>();

export interface HistoricalAnalysis {
  id: string;
  coinName: string;
  date: string;
  provider: string;
  summary: string; // Storing a snippet or the full text
  fullContent: string; // Store full markdown
}

// --- SAFE STORAGE IMPLEMENTATION ---
const createSafeStorage = () => {
  let memoryStorage: Record<string, string> = {};
  let isLocalStorageAvailable = false;

  try {
    if (typeof localStorage !== 'undefined') {
        const testKey = '__test_storage__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        isLocalStorageAvailable = true;
    }
  } catch (e) {
    // LocalStorage blocked or unavailable
    isLocalStorageAvailable = false;
  }

  return {
    getItem: (key: string): string | null => {
      if (isLocalStorageAvailable) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return memoryStorage[key] || null;
        }
      }
      return memoryStorage[key] || null;
    },
    setItem: (key: string, value: string) => {
      if (isLocalStorageAvailable) {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          memoryStorage[key] = value;
        }
      } else {
        memoryStorage[key] = value;
      }
    }
  };
};

const storage = createSafeStorage();

// --- HELPER FUNCTIONS ---

const getHistoryKey = () => {
    const email = getCurrentUserEmail() || 'guest';
    return `crypto_history_${email}`;
};

export const getUserHistory = (): HistoricalAnalysis[] => {
    try {
        const key = getHistoryKey();
        const historyJson = storage.getItem(key);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (e) {
        return [];
    }
};

export const deleteHistoryItem = (id: string): HistoricalAnalysis[] => {
    try {
        const key = getHistoryKey();
        const history = getUserHistory();
        const newHistory = history.filter(item => item.id !== id);
        storage.setItem(key, JSON.stringify(newHistory));
        return newHistory;
    } catch (e) {
        console.error("Error deleting item", e);
        return [];
    }
};

const getHistoryContext = (): string => {
  try {
    const history = getUserHistory();
    const recentHistory = history.slice(0, 3).map(h => 
      `- [${h.date}] ${h.coinName}: ${h.summary.substring(0, 50)}...`
    ).join('\n');

    if (!recentHistory) return "";
    return `\n\nCONTEXTO DO USUÁRIO (Análises anteriores):\n${recentHistory}`;
  } catch (e) {
    return "";
  }
};

const saveToHistory = (coinName: string, content: string, provider: AIProvider) => {
  try {
    const key = getHistoryKey();
    const history = getUserHistory();
    const newEntry: HistoricalAnalysis = {
      id: crypto.randomUUID(),
      coinName,
      date: new Date().toISOString(),
      provider,
      summary: content.substring(0, 150) + "...",
      fullContent: content
    };
    const updatedHistory = [newEntry, ...history].slice(0, 50);
    storage.setItem(key, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error("Error saving history", e);
  }
};

// --- PERSONA PROMPT GENERATOR ---
const getPersonaSystemInstruction = (persona: AIPersona) => {
    const base = `Você é um analista de criptomoedas experiente. Use Markdown rico. Português do Brasil.`;
    
    switch (persona) {
        case AIPersona.CONSERVATIVE:
            return `${base}
            PERSONA: "O Investidor Prudente" (Estilo Warren Buffett).
            FOCO: Fundamentos, valor de mercado, utilidade real, proteção de capital.
            TOM: Cauteloso, cético com hype, focado no longo prazo.
            OBS: Alerte fortemente sobre volatilidade.`;
        case AIPersona.DEGEN:
            return `${base}
            PERSONA: "Crypto Native / Degen" (Estilo Twitter Crypto).
            FOCO: Volatilidade, narrativa, hype, potencial de multiplicação rápida (e risco de ruína).
            TOM: Energético, usa gírias crypto (ATH, BAG, FOMO, LFG), mas ainda responsável.
            OBS: Destaque oportunidades de alto risco/retorno.`;
        case AIPersona.TECHNICAL:
            return `${base}
            PERSONA: "Analista Técnico".
            FOCO: Price Action, Suportes, Resistências, Volume, Tendência.
            TOM: Objetivo, direto, baseado em números.
            OBS: Ignore narrativas subjetivas, foque no gráfico (simulado pelos dados numéricos).`;
        case AIPersona.QUANT:
        default:
            return `${base}
            PERSONA: "Analista Quantitativo".
            FOCO: Dados estatísticos, correlações, dominância de mercado.
            TOM: Neutro, profissional, enciclopédico.`;
    }
};

// --- PROVIDER IMPLEMENTATIONS ---

const callOpenRouter = async (prompt: string, systemInstruction: string, model: string): Promise<string> => {
  if (!OPENROUTER_API_KEY) throw new Error("OpenRouter API Key ausente.");
  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model,
      messages: [{ role: "system", content: systemInstruction }, { role: "user", content: prompt }]
    })
  });

  if (!response.ok) throw new Error(`OpenRouter: ${response.statusText}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Sem resposta.";
};

const callGemini = async (prompt: string, systemInstruction: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { systemInstruction, temperature: 0.7 }
    });
    return response.text || "Sem resposta.";
};

const callHybridAnalysis = async (prompt: string, systemInstruction: string, openRouterModel?: string): Promise<string> => {
    const [geminiResult, openRouterResult] = await Promise.allSettled([
        callGemini(prompt, systemInstruction),
        callOpenRouter(prompt, systemInstruction, openRouterModel || "mistralai/mistral-7b-instruct:free")
    ]);
    const geminiText = geminiResult.status === 'fulfilled' ? geminiResult.value : "Erro Gemini";
    const openRouterText = openRouterResult.status === 'fulfilled' ? openRouterResult.value : "Erro OpenRouter";

    const synthesisPrompt = `SINTETIZE estas duas análises em uma só, mantendo o estilo da persona definida:\n\n1: ${geminiText}\n\n2: ${openRouterText}`;
    return await callGemini(synthesisPrompt, systemInstruction);
};

// --- EXPORTED ANALYSIS FUNCTIONS ---

export const analyzeMarket = async (
    coins: CoinData[], 
    type: AnalysisType, 
    provider: AIProvider = AIProvider.GEMINI,
    openRouterModel: string = "mistralai/mistral-7b-instruct:free",
    persona: AIPersona = AIPersona.QUANT
): Promise<string> => {
  const marketSummary = coins.map(c => ({
    n: c.name, s: c.symbol, p: c.current_price, c24: c.price_change_percentage_24h, mcap: c.market_cap
  })).slice(0, 10);

  const prompt = `Analise este mercado Top 10 (${type}): ${JSON.stringify(marketSummary)}. ${getHistoryContext()}`;
  const systemInstruction = getPersonaSystemInstruction(persona);

  try {
    let result = "";
    if (provider === AIProvider.HYBRID) result = await callHybridAnalysis(prompt, systemInstruction, openRouterModel);
    else if (provider === AIProvider.OPENROUTER) result = await callOpenRouter(prompt, systemInstruction, openRouterModel);
    else result = await callGemini(prompt, systemInstruction);
    
    saveToHistory("Market Overview", result, provider);
    return result;
  } catch (e) { return `Erro: ${(e as Error).message}`; }
};

export const analyzeSpecificCoin = async (
    coin: CoinData, 
    provider: AIProvider = AIProvider.GEMINI,
    openRouterModel: string = "mistralai/mistral-7b-instruct:free",
    persona: AIPersona = AIPersona.QUANT
): Promise<string> => {
    const cacheKey = `${coin.id}-${provider}-${persona}`;
    const cached = analysisCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) return cached.content;

    const prompt = `Analise ${coin.name} (${coin.symbol}). Preço: $${coin.current_price}, Var 24h: ${coin.price_change_percentage_24h}%, ATH: $${coin.ath} (${coin.ath_change_percentage}%). Veredito de investimento?`;
    const systemInstruction = getPersonaSystemInstruction(persona);

    try {
        let result = "";
        if (provider === AIProvider.HYBRID) result = await callHybridAnalysis(prompt, systemInstruction, openRouterModel);
        else if (provider === AIProvider.OPENROUTER) result = await callOpenRouter(prompt, systemInstruction, openRouterModel);
        else result = await callGemini(prompt, systemInstruction);

        analysisCache.set(cacheKey, { content: result, timestamp: Date.now(), provider, persona });
        saveToHistory(coin.name, result, provider);
        return result;
    } catch (e) { return `Erro: ${(e as Error).message}`; }
};

export const sendChatMessage = async (
    history: ChatMessage[],
    newMessage: string
): Promise<string> => {
    // Construct a context string from recent history (last 5 messages)
    const context = history.slice(-6).map(msg => `${msg.role === 'user' ? 'Usuário' : 'Especialista'}: ${msg.text}`).join('\n');
    
    const prompt = `CONTEXTO DA CONVERSA:\n${context}\n\nNOVA PERGUNTA DO USUÁRIO: ${newMessage}`;

    const systemInstruction = `
    Você é o "CryptoMentor", um especialista em educação financeira e criptomoedas.
    
    SEU OBJETIVO:
    1. Ensinar iniciantes sobre conceitos de blockchain e cripto (DeFi, NFTs, Staking, etc).
    2. Analisar tendências de mercado para usuários intermediários.
    
    DIRETRIZES:
    - Use Markdown rico (negrito, listas, code blocks).
    - Seja extremamente didático e paciente.
    - Use analogias do mundo real para explicar conceitos técnicos.
    - Se perguntarem "Vale a pena comprar X?", explique os riscos e os fundamentos, nunca dê conselho financeiro direto "Sim/Não".
    - Responda em Português do Brasil.
    - Mantenha respostas concisas, evite textões enormes a menos que solicitado.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { systemInstruction, temperature: 0.6 }
        });
        return response.text || "Desculpe, não consegui processar sua pergunta.";
    } catch (e) {
        return "Erro ao conectar com o CryptoMentor. Tente novamente.";
    }
};