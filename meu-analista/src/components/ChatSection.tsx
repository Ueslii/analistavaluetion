
import React, { useState } from 'react';
import { Message, StockData } from '../types';
import TypingIndicator from './TypingIndicator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ChatSectionProps {
  onStockSearch: (ticker: string) => Promise<StockData | null>;
}
export type Persona= 'Conservadora' | 'Realista' | 'Otimista'
export default function ChatSection({ onStockSearch }: ChatSectionProps) {
  const [persona, setPersona] = useState<Persona>('Realista');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'bot', text: 'Olá! Sou seu Analista de Valuation. Por favor, insira o ticker da ação (ex: PETR4, MGLU3).' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);

   const handleCopyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      // Reseta o estado do ícone após 2 segundos
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (err) {
      console.error('Falha ao copiar texto: ', err);
    }
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userInput = input.trim(); // Mantém o case original para perguntas
    if (userInput === '' || isLoading) return;

    setIsLoading(true);
    const newUserMessage: Message = { id: Date.now(), sender: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');

    // Regex para identificar um padrão de ticker (ex: PETR4, MGLU3, BIDI11)
    const tickerRegex = /^[A-Z]{4}\d{1,2}$/i;
    
    // --- BIFURCAÇÃO LÓGICA ADICIONADA AQUI ---
    if (tickerRegex.test(userInput)) {
      // FLUXO 1: A entrada PARECE ser um Ticker
      const thinkingMessage: Message = { id: Date.now() + 1, sender: 'bot', text: 'Buscando dados...' };
      setMessages(prev => [...prev, thinkingMessage]);

      try {
        const fetchedStockData = await onStockSearch(userInput.toUpperCase());
        if (!fetchedStockData) {
          throw new Error("Ação não encontrada.");
        }
        
        // Atualiza a mensagem para "Analisando..."
        setMessages(prev => prev.map(msg => msg.id === thinkingMessage.id ? { ...msg, text: 'Analisando...' } : msg));

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userInput, history: messages, stockData: fetchedStockData, persona: persona}),
        });

        if (!response.ok) throw new Error(`O servidor respondeu com o status: ${response.status}`);
        
        const data = await response.json();
        const botResponse: Message = { id: Date.now() + 2, sender: 'bot', text: data.message };
        
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== thinkingMessage.id);
          return [...filtered, botResponse];
        });

      } catch (error) {
        console.error("Erro no fluxo do chat (ticker):", error);
        const errorMsg = (error as Error).message === "Ação não encontrada." 
          ? '❌ Não encontrei dados para este ticker. Verifique o código e tente novamente.'
          : '❌ Desculpe, ocorreu um erro na análise.';
        const errorResponse: Message = { id: Date.now() + 2, sender: 'bot', text: errorMsg };
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== thinkingMessage.id);
          return [...filtered, errorResponse];
        });
      } finally {
        setIsLoading(false);
      }

    } else {
      // FLUXO 2: A entrada é tratada como uma Pergunta Geral
      const thinkingMessage: Message = { id: Date.now() + 1, sender: 'bot', text: 'Pensando...' };
      setMessages(prev => [...prev, thinkingMessage]);

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // AQUI ESTÁ A DIFERENÇA: enviamos sem o 'stockData'
          body: JSON.stringify({ message: userInput, persona: persona , history: messages}),
        });

        if (!response.ok) throw new Error("Falha na comunicação com a IA.");
        const data = await response.json();
        const botResponse: Message = { id: Date.now() + 2, sender: 'bot', text: data.message };

        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== thinkingMessage.id);
          return [...filtered, botResponse];
        });

      } catch (error) {
        console.error("Erro no fluxo do chat (pergunta geral):", error);
        const errorResponse: Message = { id: Date.now() + 2, sender: 'bot', text: '❌ Desculpe, não consegui processar sua pergunta.' };
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== thinkingMessage.id);
          return [...filtered, errorResponse];
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  const personas: Persona[] = ['Conservadora', 'Realista', 'Otimista']; 
  return (
    <section className="mb-20">
      <div className="w-full h-[70vh] flex flex-col border border-white/10 rounded-lg shadow-lg">
        <header className="bg-white/5 p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-text-primary text-center">Analista de Ação</h2>
        </header>
        <main className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              <div className={`group relative ${message.sender === 'user' ? 'bg-primary/80 text-white' : 'bg-secondary/20 text-text-primary'} p-3 rounded-lg max-w-md`}>
                
                <button
                    onClick={() => handleCopyToClipboard(message.text, message.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-background/50 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background/80 hover:text-text-primary"
                    aria-label="Copiar resposta"
                  >
                    {copiedMessageId === message.id ? (
                      <CheckIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <ClipboardDocumentIcon className="h-5 w-5" />
                    )}
                  </button>
                {message.text === 'Analisando...' ? <TypingIndicator /> : <ReactMarkdown
                
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({node, ...props}) => <table className="w-full border-collapse" {...props} />,
                      th: ({node, ...props}) => <th className="border border-white/20 p-2 font-bold" {...props} />,
                      td: ({node, ...props}) => <td className="border border-white/20 p-2" {...props} />,
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>}
              </div>
            </div>
          
          ))}
        </main>
        <footer className="p-4 border-t border-white/10">
            <div className="flex items-baseline  justify-center gap-4 mb-3 px-1">
            <span className="text-sm font-medium text-text-secondary">Tipo de Análise:</span>
            <div className="flex items-baseline gap-2">
              {personas.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPersona(p)}
                  disabled={isLoading}
                  className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 disabled:opacity-50 ${
                    persona === p
                      ? 'bg-primary text-white font-semibold'
                      : 'bg-white/5 text-text-secondary hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <form className="flex gap-2" onSubmit={handleSendMessage}>

            <input
              type="text"
              placeholder="Digite o ticker aqui..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full flex-1 p-3 rounded-lg bg-background border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary disabled:opacity-50"
              disabled={isLoading}
            />

            <button
              type="submit"
              className="flex-shrink-0 bg-primary hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Analisando...' : 'Enviar'}
            </button>
          </form>
        </footer>
      </div>
    </section>
  );
}