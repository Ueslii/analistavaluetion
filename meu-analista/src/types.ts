// src/types.ts

// Esta interface é necessária para o histórico do gráfico
export interface StockHistory {
  date: string;
  close: number;
}

// Esta é a interface StockData completa, unindo as duas versões
export interface StockData {
  ticker: string;
  companyName: string;
  price: number; // Corrigido para number, pois é usado em cálculos
  variation: number; // Corrigido para number
  marketCap: number; // Campo que faltava
  sharesOutstanding: number; // Corrigido para number
  ttmFreeCashFlow: number; // Campo que faltava
  totalDebt: number; // Corrigido para number
  estimatedWACC: number; // Campo que faltava
  history: StockHistory[]; // Campo que faltava
  indicators: {
    pl: number | null; // Corrigido para number
    pvp: number | null; // Corrigido para number
    dy: number | null; // Corrigido para number
  };
}

// A interface Message continua a mesma
export interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}