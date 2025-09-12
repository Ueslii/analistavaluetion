// src/types.ts

// Define o formato dos dados de uma ação
export interface StockData {
  ticker: string;
  companyName: string;
  price: string;
  variation: string;
  sharesOutstanding: string | null;
  totalDebt: string | null;
  totalCash: string | null
  netIncome?: string | null;
  sector?: string | null; 
  indicators: {
    pl: string | number | null;
    pvp: string | number | null;
    dy: string | null;
    fcf: string | null;
  };
}

// Define o formato de uma mensagem no chat
export interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}