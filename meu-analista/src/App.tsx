import React from 'react';

// Importando todos os nossos componentes
import Header from './components/Header.js';
import Hero from './components/Hero.js';
import ChatSection from './components/ChatSection.js';
import Footer from './components/Footer.js';
import DataPanel from './components/DataPainel.js';
import KeyWidgets from './components/KeyWidgets.js';
import HowToUse from './components/HowToUse.js';
import Disclaimer from './components/Disclaimer.js';
import  { useState } from 'react';

function App() {
  // 1. Criamos o estado aqui, no componente pai
  const [stockData, setStockData] = useState(null);

  // 2. Criamos uma função para atualizar o estado
  const handleStockSearch = async (ticker) => {
    try {
      const response = await fetch(`http://localhost:3001/api/stock/${ticker}`);
      if (!response.ok) {
        throw new Error('Ação não encontrada');
      }
      const data = await response.json();
      setStockData(data); // Atualiza o estado com os dados reais
    } catch (error) {
      console.error(error);
      setStockData(null); // Limpa os dados se der erro
    }
  };
  return (
    
    <div className="bg-background text-text-primary min-h-screen flex flex-col font-sans">
      
      <Header />

      <main className="w-full flex-1">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <Hero />
          <div className='flex flex-col lg:flex-row gap-8 mb-20'>
            <div className='lg:w-1/3'>
              <DataPanel />
            </div>
            <div className='lg:w-2/3'>
              <ChatSection />
            </div>
          </div>
          <KeyWidgets/>
          <HowToUse/>
          <Disclaimer/>
        </div>
      </main>

      <Footer />
      
    </div>
  )
}

export default App;