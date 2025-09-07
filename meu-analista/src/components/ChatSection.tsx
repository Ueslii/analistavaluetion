// src/components/ChatSection.tsx

import React, { useState } from 'react';
import { Message, StockData } from '../types'; // Corrigido para buscar da pasta pai
import TypingIndicator from './TypingIndicator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatSectionProps {
  onStockSearch: (ticker: string) => Promise<StockData | null>;
}

export default function ChatSection({ onStockSearch }: ChatSectionProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'bot', text: 'Olá! Sou seu Analista de Valuation. Por favor, insira o ticker da ação (ex: PETR4, MGLU3).' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userInput = input.trim().toUpperCase();
    if (userInput === '' || isLoading) return;

    setIsLoading(true);

    const newUserMessage: Message = { id: Date.now(), sender: 'user', text: userInput };
    const thinkingMessage: Message = { id: Date.now() + 1, sender: 'bot', text: 'Analisando...' };
    
    setMessages(prev => [...prev, newUserMessage, thinkingMessage]);
    setInput('');

    try {
      const fetchedStockData = await onStockSearch(userInput);
      if (!fetchedStockData) {
        throw new Error("Não foi possível encontrar os dados da ação para a análise.");
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput, stockData: fetchedStockData }),
      });

      if (!response.ok) throw new Error(`O servidor respondeu com o status: ${response.status}`);
      
      const data = await response.json();
      const botResponse: Message = { id: Date.now() + 2, sender: 'bot', text: data.message };
      
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== thinkingMessage.id);
        return [...filtered, botResponse];
      });

    } catch (error) {
      console.error("Erro no fluxo do chat:", error);
      const errorResponse: Message = { id: Date.now() + 2, sender: 'bot', text: '❌ Desculpe, ocorreu um erro. Verifique o ticker e tente novamente.' };
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== thinkingMessage.id);
        return [...filtered, errorResponse];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-20">
      <div className="w-full max-w-4xl mx-auto h-[70vh] flex flex-col border border-white/10 rounded-lg shadow-lg">
        <header className="bg-white/5 p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-text-primary text-center">Analista de Ação</h2>
        </header>
        <main className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${message.sender === 'user' ? 'bg-primary/80 text-white' : 'bg-secondary/20 text-text-primary'} p-3 rounded-lg max-w-md`}>
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