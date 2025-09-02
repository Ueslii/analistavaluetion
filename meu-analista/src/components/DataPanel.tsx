// src/components/DataPanel.tsx

import React from "react";
import { StockData } from "./types"; // Importando nosso tipo centralizado

interface DataPanelProps {
  stockData: StockData | null;
}

export default function DataPanel({ stockData }: DataPanelProps) {
  if (!stockData) {
    return (
      <div className="border border-white/10 rounded-lg p-6 h-[70vh] flex flex-col justify-center items-center">
        <p className="text-text-secondary text-center">Aguardando ticker no chat para iniciar a análise...</p>
      </div>
    );
  }

  return (
    <div className="border border-white/10 rounded-lg p-6 h-[70vh] flex flex-col">
      <div className='border-b border-white/10 pb-4 mb-4'>
        <h2 className='text-2xl font-bold'>{stockData.ticker}</h2>
        <p className='text-sm text-text-secondary'>{stockData.companyName}</p>
      </div>
      <div className='mb-6'>
        <div className='flex items-baseline'>
          <p className='text-4xl font-bold text-text-primary'>{stockData.price}</p>
          <span className='text-lg font-semibold text-primary ml-3'>{stockData.variation}</span>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Indicadores Chave</h3>
        <div className="space-y-2 text-text-secondary">
          <div className="flex justify-between">
            <span>P/L</span>
            <span className="font-mono text-text-primary">{stockData.indicators.pl}</span>
          </div>
          <div className="flex justify-between">
            <span>P/VP</span>
            <span className="font-mono text-text-primary">{stockData.indicators.pvp}</span>
          </div>
          <div className="flex justify-between">
            <span>Dividend Yield</span>
            <span className="font-mono text-text-primary">{stockData.indicators.dy}</span>
          </div>
        </div>
      </div>
    </div>
  );
}