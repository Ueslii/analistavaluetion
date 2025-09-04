// src/components/ChatSection.tsx

import React, { useState } from 'react';
import { Message, StockData } from '../types';
import TypingIndicator from './TypingIndicator';

interface ChatSectionProps {
  onStockSearch: (ticker: string) => void; // Apenas avisa para buscar
  stockData: StockData | null;           // Recebe os dados encontrados
}

export default function ChatSection({ onStockSearch, stockData }: ChatSectionProps) {
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
    onStockSearch(userInput); // 1. Apenas "dispara" a busca de dados no App

    const newUserMessage: Message = { id: Date.now(), sender: 'user', text: userInput };
    const thinkingMessage: Message = { id: Date.now() + 1, sender: 'bot', text: 'Analisando...' };
    setMessages(prev => [...prev, newUserMessage, thinkingMessage]);
    setInput('');

    // Pequeno truque: esperamos um instante para dar tempo ao App de atualizar o stockData
    setTimeout(async () => {
      try {
        // 2. Usamos a prop 'stockData' mais atualizada que o App nos forneceu
        if (!stockData) {
          throw new Error("Dados da ação não foram carregados a tempo para a análise.");
        }
        
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'; 
        const response = await fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userInput, stockData: stockData }),
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
    }, 1000); // Atraso de 1 segundo para garantir que o estado foi atualizado
  };

  // O resto do seu componente (a parte do return) continua igual
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
                              {message.text === 'Analisando...' ? <TypingIndicator /> : <p className="whitespace-pre-wrap">{message.text}</p>}
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