// src/App.tsx

import React, { useState } from 'react';
import { StockData } from './types'; // Corrigido para buscar da raiz do src

import Header from './components/Header';
import Hero from './components/Hero';
import ChatSection from './components/ChatSection';
import Footer from './components/Footer';
import DataPanel from './components/DataPanel';
import KeyWidgets from './components/KeyWidgets';
import HowToUse from './components/HowToUse';
import Disclaimer from './components/Disclaimer';
import DataPanelSkeleton from './components/DataPanelSkeleton';
import PdfAnalysis from './components/PdfAnalysis';

function App() {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStockSearch = async (ticker: string): Promise<StockData | null> => {
    setIsLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    try {
      const response = await fetch(`${apiUrl}/api/stock/${ticker}`);
      if (!response.ok) throw new Error('Ação não encontrada');
      const data: StockData = await response.json();
      setStockData(data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados da ação:", error);
      setStockData(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-text-primary min-h-screen flex flex-col font-sans">
      <Header />
      <main className="w-full flex-1">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <Hero />

          <div className="w-full flex flex-col lg:flex-row gap-8 mb-20 min-w-0">
            <div className="lg:w-1/3">
              {isLoading ? <DataPanelSkeleton /> : (
              <DataPanel stockData={stockData} 
              onStockSearch={handleStockSearch} /> )}
            </div>
            <div className="lg:w-2/3 min-w-0">
              <section id='comecar-analise'><ChatSection onStockSearch={handleStockSearch} /> </section>
            </div>
          
          </div>
          <section id='sobre'>
          <KeyWidgets />
          </section>

          <section id='como-funciona'>
            <HowToUse />
          </section>
          
          <section id='guia-pdf'>
            <PdfAnalysis />
          </section>

          <section id='aviso'>
            <Disclaimer />
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;