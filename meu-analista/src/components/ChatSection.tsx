import React, { useState, useRef } from 'react';
import { Message, StockData } from '../types';
import TypingIndicator from './TypingIndicator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ClipboardDocumentIcon, CheckIcon, PaperClipIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ChatSectionProps {
  onStockSearch: (ticker: string) => Promise<StockData | null>;
}
export type Persona = 'Conservadora' | 'Realista' | 'Otimista';

export default function ChatSection({ onStockSearch }: ChatSectionProps) {
  const [persona, setPersona] = useState<Persona>('Realista');
  const [input, setInput] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingStatus, setLoadingStatus] = useState<{ active: boolean; message: string }>({ active: false, message: '' });
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'bot', text: 'Olá! Sou seu Analista de Valuation. Insira o ticker da ação (Ex: PETR4, ITUB4... ) ou anexe um PDF (DFP/ITR) para uma análise mais profunda.' },
  ]);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);

  const handleCopyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Falha ao copiar texto: ', err);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      setPdfFile(null);
    }
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userInput = input.trim();
    if ((userInput === '' && !pdfFile) || loadingStatus.active) return;

    setLoadingStatus({ active: true, message: 'Iniciando...' });
    let userMessageText = userInput;
    if (pdfFile) {
        userMessageText += `\n*Analisando com o arquivo: ${pdfFile.name}*`;
    }
    const newUserMessage: Message = { id: Date.now(), sender: 'user', text: userMessageText };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    
    const tickerRegex = /^[A-Z]{4}\d{1,2}$/i;
    const tickerMatch = userInput.match(tickerRegex);

    if (!tickerMatch) {
        setMessages(prev => [...prev, {id: Date.now()+1, sender: 'bot', text: 'Por favor, insira um ticker válido (ex: PETR4) para iniciar a análise, mesmo ao enviar um PDF.'}]);
        setLoadingStatus({ active: false, message: '' });
        if (fileInputRef.current) fileInputRef.current.value = "";
        setPdfFile(null);
        return;
    }
    
    const ticker = tickerMatch[0].toUpperCase();
    
    try {
      setLoadingStatus({ active: true, message: 'Buscando dados...' });
      const fetchedStockData = await onStockSearch(ticker);
      if (!fetchedStockData) throw new Error("Ação não encontrada.");

      let pdfTextContent: string | null = null;
      if (pdfFile) {
        setLoadingStatus({ active: true, message: 'Enviando PDF...' });
        const formData = new FormData();
        formData.append('pdf', pdfFile);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const uploadResponse = await fetch(`${apiUrl}/api/upload-pdf`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.message || 'Falha ao processar o PDF.');
        }
        const pdfData = await uploadResponse.json();
        pdfTextContent = pdfData.text;
      }
      
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPdfFile(null); 

      setLoadingStatus({ active: true, message: 'Analisando...' });
      const thinkingMessage: Message = { id: Date.now() + 1, sender: 'bot', text: 'Analisando...' };
      setMessages(prev => [...prev, thinkingMessage]);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          history: messages,
          stockData: fetchedStockData,
          persona: persona,
          pdfText: pdfTextContent, 
        }),
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
      const errorMsg = (error as Error).message || 'Desculpe, ocorreu um erro na análise.';
      const errorResponse: Message = { id: Date.now() + 2, sender: 'bot', text: `❌ ${errorMsg}` };
      setMessages(prev => prev.filter(msg => msg.text !== 'Analisando...').concat(errorResponse));
    } finally {
      setLoadingStatus({ active: false, message: '' });
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
              <div className={`group relative ${message.sender === 'user' ? 'bg-primary/80 text-white' : 'bg-secondary/20 text-text-primary'} p-3 rounded-lg max-w-2xl`}>
                <button
                    onClick={() => handleCopyToClipboard(message.text, message.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-background/50 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background/80 hover:text-text-primary"
                    aria-label="Copiar resposta"
                  >
                    {copiedMessageId === message.id ? <CheckIcon className="h-5 w-5 text-primary" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                  </button>
                {message.text === 'Analisando...' ? <TypingIndicator /> : <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({node, ...props}) => <div className="overflow-x-auto"><table className="w-full border-collapse" {...props} /></div>,
                      th: ({node, ...props}) => <th className="border border-white/20 p-2 font-bold bg-white/5" {...props} />,
                      td: ({node, ...props}) => <td className="border border-white/20 p-2" {...props} />,
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>}
              </div>
            </div>
          ))}
        </main>
        
        {/* ***** INÍCIO DAS ALTERAÇÕES ***** */}
        <footer className="p-4 border-t border-white/10">
            <div className="flex items-baseline justify-center gap-4 mb-3 px-1">
              <span className="text-sm font-medium text-text-secondary">Tipo de Análise:</span>
              <div className="flex items-baseline gap-2">
                {personas.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPersona(p)}
                    disabled={loadingStatus.active}
                    className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 disabled:opacity-50 ${
                      persona === p ? 'bg-primary text-white font-semibold' : 'bg-white/5 text-text-secondary hover:bg-white/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* NOVO: Indicador de arquivo anexado */}
            {pdfFile && (
              <div className="mb-2 px-1 flex justify-start">
                <div className="flex items-center gap-2 text-sm bg-secondary/20 text-text-primary px-3 py-1.5 rounded-full">
                  <PaperClipIcon className="h-4 w-4" />
                  <span className="truncate max-w-xs" title={pdfFile.name}>{pdfFile.name}</span>
                  <button
                      type="button"
                      onClick={() => {
                          setPdfFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="p-0.5 rounded-full hover:bg-white/20"
                      aria-label="Remover PDF"
                  >
                      <XCircleIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <form className="flex gap-2 items-center" onSubmit={handleSendMessage}>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                disabled={loadingStatus.active}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-lg bg-background border border-white/10 hover:bg-white/5 transition-colors"
                disabled={loadingStatus.active}
                aria-label="Anexar PDF"
              >
                <PaperClipIcon className="h-6 w-6 text-text-secondary"/>
              </button>
              <div className="relative flex-1">
                <input
                  type="text"
                  // Placeholder agora é fixo
                  placeholder="Digite o ticker aqui..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full p-3 rounded-lg bg-background border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary disabled:opacity-50"
                  disabled={loadingStatus.active}
                />
              </div>
              <button
                type="submit"
                className="flex-shrink-0 bg-primary hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loadingStatus.active}
              >
                {loadingStatus.active ? loadingStatus.message : 'Enviar'}
              </button>
            </form>
        </footer>
        {/* ***** FIM DAS ALTERAÇÕES ***** */}

      </div>
    </section>
  );
}