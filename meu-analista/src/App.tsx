// src/App.tsx

import React, { useState } from 'react';
import { StockData } from './components/types';

import Header from './components/Header';
import Hero from './components/Hero';
import ChatSection from './components/ChatSection';
import Footer from './components/Footer';
import DataPanel from './components/DataPanel';
import KeyWidgets from './components/KeyWidgets';
import HowToUse from './components/HowToUse';
import Disclaimer from './components/Disclaimer';
import DataPanelSkeleton from './components/DataPanelSkeleton';

function App() {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // MUDANÇA: Agora esta função retorna os dados encontrados (ou null)
  const handleStockSearch = async (ticker: string): Promise<StockData | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/stock/${ticker}`);
      if (!response.ok) throw new Error('Ação não encontrada');
      const data: StockData = await response.json();
      setStockData(data);
      return data; // Retorna os dados para quem chamou (o ChatSection)
    } catch (error) {
      console.error("Erro ao buscar dados da ação:", error);
      setStockData(null);
      return null; // Retorna nulo em caso de erro
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
          <div className="flex flex-col lg:flex-row gap-8 mb-20">
            <div className="lg:w-1/3">
              {isLoading ? <DataPanelSkeleton /> : <DataPanel stockData={stockData} />}
            </div>
            <div className="lg:w-2/3">
              <ChatSection onStockSearch={handleStockSearch} />
            </div>
          </div>
          <KeyWidgets />
          <HowToUse />
          <Disclaimer />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;