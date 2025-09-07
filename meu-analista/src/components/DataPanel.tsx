// src/components/DataPanel.tsx
import React from "react";
import DataPanelSkeleton from "./DataPanelSkeleton";
import 'chart.js/auto';
import { Line } from "react-chartjs-2";

interface StockHistory {
  date: string;
  close: number;
}

interface StockData {
  ticker: string;
  companyName: string;
  price: number;
  variation: number;
  marketCap: number;
  sharesOutstanding: number;
  ttmFreeCashFlow: number;
  totalDebt: number;
  estimatedWACC: number;
  history: StockHistory[];
  indicators: {
    pl: number;
    pvp: number;
    dy: number;
  };
}

interface DataPanelProps {
  loading?: boolean;
  stockData?: StockData | null;
}

const formatNumber = (num: number | null | undefined, options: Intl.NumberFormatOptions = {}) => {
  if (num === null || num === undefined) return "N/A";
  return new Intl.NumberFormat('pt-BR', options).format(num);
};

const formatPercentage = (num: number | null | undefined) => {
  if (num === null || num === undefined) return "N/A";
  return `${(num * 100).toFixed(2)}%`.replace('.', ',');
};

export default function DataPanel({ loading, stockData }: DataPanelProps) {
  if (loading) return <DataPanelSkeleton />;

  if (!stockData) {
    return (
      <div className="border border-white/10 rounded-lg p-6 h-[70vh] flex flex-col justify-center items-center text-gray-400">
        Aguardando ticker no chat para iniciar a análise...
      </div>
    );
  }

  const priceFormatted = formatNumber(stockData.price, { style: 'currency', currency: 'BRL' });
  const marketCapFormatted = formatNumber(stockData.marketCap, { style: 'currency', currency: 'BRL', notation: 'compact' });
  const sharesFormatted = formatNumber(stockData.sharesOutstanding, { notation: 'compact' });
  const fcfFormatted = formatNumber(stockData.ttmFreeCashFlow, { style: 'currency', currency: 'BRL', notation: 'compact' });
  const debtFormatted = formatNumber(stockData.totalDebt, { style: 'currency', currency: 'BRL', notation: 'compact' });

  const chartLabels = (stockData.history || []).map((h) => h.date);
  const chartDataPoints = (stockData.history || []).map((h) => h.close);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: `${stockData.ticker} - último mês (fechamento)`,
        data: chartDataPoints,
        fill: 'start',
        tension: 0.4,
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(34, 197, 94, 1)',
      },
    ],
  };

  return (
    <div className="border border-white/10 rounded-lg p-6 h-[70vh] flex flex-col bg-white/2">
      <div className="border-b border-white/10 pb-4 mb-4">
        <h3 className="text-xl font-semibold text-white">{stockData.companyName} <span className="text-sm text-gray-400">({stockData.ticker})</span></h3>
        <p className="text-sm text-gray-400">Última atualização automática</p>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <p className="text-3xl font-bold text-green-400">{priceFormatted}</p>
          <p className="text-sm text-gray-300">Variação: {formatPercentage(stockData.variation)}</p>
          <p className="text-sm text-gray-300">MarketCap: {marketCapFormatted}</p>
        </div>

        <div className="w-1/2 relative">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto">
        <div>
          <h4 className="font-semibold mb-2">📊 Indicadores</h4>
          <table className="table-auto text-sm">
            <tbody>
              <tr><td className="pr-4">P/L</td><td>{formatNumber(stockData.indicators?.pl)}</td></tr>
              <tr><td className="pr-4">P/VP</td><td>{formatNumber(stockData.indicators?.pvp)}</td></tr>
              <tr><td className="pr-4">Dividend Yield</td><td>{formatPercentage(stockData.indicators?.dy)}</td></tr>
            </tbody>
          </table>
        </div>

        <div>
          <h4 className="font-semibold mb-2">📁 Dados contábeis / extras</h4>
          <table className="table-auto text-sm">
            <tbody>
              <tr><td className="pr-4">Ações (total)</td><td>{sharesFormatted}</td></tr>
              <tr><td className="pr-4">FCF (12M)</td><td>{fcfFormatted}</td></tr>
              <tr><td className="pr-4">Dívida Total</td><td>{debtFormatted}</td></tr>
              <tr><td className="pr-4">WACC (estim.)</td><td>{formatPercentage(stockData.estimatedWACC)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}