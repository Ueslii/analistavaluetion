
import React, { useState } from 'react';

export default function ChatSection({ onStockSearch }) {

  const [input, setInput] = useState(''); // Estado para guardar o que o usuário digita
  const [messages, setMessages] = useState([ // Estado para guardar a lista de mensagens
    {
      id: 1,
      sender: 'bot',
      text: 'Olá! Sou seu Analista de Valuation. Por favor, insira o ticker da ação que você deseja analisar (ex: PETR4, MGLU3).',
    },
  ]);

  // ETAPA 3: Função que é executada quando o formulário é enviado
// src/components/ChatSection.tsx

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userInput = input.trim();
    if (userInput === '') return;

    // --- CORREÇÃO DA MENSAGEM DUPLICADA ---
    // Criamos as duas mensagens primeiro
    const newUserMessage = { id: Date.now(), sender: 'user', text: userInput };
    const thinkingMessage = { id: Date.now() + 1, sender: 'bot', text: 'Analisando...' };

    // Adicionamos as duas de uma vez à tela e limpamos o input
    setMessages(prev => [...prev, newUserMessage, thinkingMessage]);
    setInput('');
onStockSearch(userInput.toUpperCase()); 
    try {
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
      });

      // Se a resposta do servidor não for OK (ex: erro 500), lança um erro
      if (!response.ok) {
        throw new Error(`O servidor respondeu com o status: ${response.status}`);
      }

      const data = await response.json();

      const botResponse = { id: Date.now() + 2, sender: 'bot', text: data.message };
      
      // Remove a mensagem "Analisando..." e adiciona a resposta final da IA
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== thinkingMessage.id);
        return [...filteredMessages, botResponse];
      });

    } catch (error) {
      console.error("Erro ao conectar com o backend:", error);
      
      const errorResponse = { id: Date.now() + 2, sender: 'bot', text: 'Desculpe, não consegui me conectar ao servidor.' };

      // Remove a mensagem "Analisando..." e adiciona a mensagem de erro
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== thinkingMessage.id);
        return [...filteredMessages, errorResponse];
      });
    }
  };

  return (
    <section className="mb-20">
      <div className="w-full max-w-4xl mx-auto h-[70vh] flex flex-col border border-white/10 rounded-lg shadow-lg">
        
        <header className="bg-white/5 p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-text-primary text-center">
            Analista de Ação
          </h2>
        </header>

        <main className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`${message.sender === 'user' ? 'bg-primary/80 text-white' : 'bg-secondary/20 text-text-primary'} p-3 rounded-lg max-w-md`}>
                <p>{message.text}</p>
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
              className="flex-1 p-3 rounded-lg bg-background border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
            >
              Enviar
            </button>
          </form>
        </footer>

      </div>
    </section>
  );
}