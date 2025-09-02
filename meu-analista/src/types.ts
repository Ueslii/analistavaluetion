// src/types.ts

// Define o formato dos dados de uma ação
export interface StockData {
  ticker: string;
  companyName: string;
  price: string;
  variation: string;
  indicators: {
    pl: string | number | null;
    pvp: string | number | null;
    dy: string | null;
  };
}

// Define o formato de uma mensagem no chat
export interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}