// src/components/DataPanel.tsx
import React from "react";
import 'chart.js/auto';
import { Line } from "react-chartjs-2";
import { StockData } from "../types";
import DataPanelSkeleton from "./DataPanelSkeleton";

interface DataPanelProps {
  loading?: boolean;
  stockData?: StockData | null;
  onStockSearch: (ticker: string) => void;
}

const formatNumber = (num: number | null | undefined, options: Intl.NumberFormatOptions = {}) => {
  if (num === null || num === undefined) return "N/A";
  return new Intl.NumberFormat('pt-BR', options).format(num);
};

const formatPercentage = (num: number | null | undefined) => {
  if (num === null || num === undefined) return "N/A";
  return `${(num * 100).toFixed(2)}%`.replace('.', ',');
};

export default function DataPanel({ loading, stockData, onStockSearch }: DataPanelProps) {
  if (loading) return <DataPanelSkeleton />;

  if (!stockData) {
    return (
      <div className="border border-white/10 rounded-lg p-6 h-[70vh] flex flex-col justify-center items-center text-gray-400">
        <p className="text-text-secondary mb-6">Aguardando ticker no chat para iniciar a análise...</p>
        <button 
          onClick={() => onStockSearch('PETR4')}
          className="bg-green-500 text-background font-bold py-2 px-6 rounded-lg hover:bg-green-400 transition-colors"
        >
          Analisar PETR4 (Exemplo)
        </button>
      </div>
    );
  }
if (stockData.history && stockData.history.length > 0) {
    console.log('FORMATO DA DATA RECEBIDA:', stockData.history[0].date);
  }
  const priceFormatted = formatNumber(stockData.price, { style: 'currency', currency: 'BRL' });
  const marketCapFormatted = formatNumber(stockData.marketCap, { style: 'currency', currency: 'BRL', notation: 'compact' });


  const chartLabels = (stockData.history || []).map((h) => {

  const parts = h.date.split('/');

  const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
});
  const chartDataPoints = (stockData.history || []).map((h) => h.close);

  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: 'Fechamento',
      data: chartDataPoints,
      fill: 'start',
      tension: 0.4,
      borderColor: 'rgba(34, 197, 94, 1)',
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      pointRadius: 2,
      pointHoverRadius: 6,
      pointBackgroundColor: 'rgba(34, 197, 94, 1)',
    }],
  };
  
 
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)', maxTicksLimit: 8 },
        grid: { display: false },
      },
      y: {
        beginAtZero: false,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          maxTicksLimit: 5, 
          callback: (value: any) => 'R$ ' + Number(value).toFixed(2)
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      }
    }
  };

  return (

    <div className="w-full border border-white/10 rounded-lg p-6 flex flex-col gap-4 bg-slate-900/50">
      

      <div className="border-b border-white/10 pb-4 flex-shrink-0">
        <h3 className="text-xl font-semibold text-white">{stockData.companyName} ({stockData.ticker})</h3>
        <p className="text-sm text-gray-400">Última atualização automática</p>
      </div>


      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        <div className="flex-shrink-0">
          <p className="text-3xl font-bold text-green-400">{priceFormatted}</p>
          <p className="text-sm text-gray-300">Variação: {formatPercentage(stockData.variation)}</p>
          <p className="text-sm text-gray-300">MarketCap: {marketCapFormatted}</p>
        </div>
        <div className= " md:w-1/2 flex-1 relative">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
        <div>
          <h4 className="font-semibold mb-2">📊 Indicadores</h4>
          <table className="table-auto text-sm w-full text-left">
            <tbody>
              <tr><td className="pr-4 py-1">P/L</td><td>{formatNumber(stockData.indicators?.pl)}</td></tr>
              <tr><td className="pr-4 py-1">P/VP</td><td>{formatNumber(stockData.indicators?.pvp)}</td></tr>
              <tr><td className="pr-4 py-1">Dividend Yield</td><td>{formatPercentage(stockData.indicators?.dy)}</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <h4 className="font-semibold mb-2">📁 Dados Contábeis</h4>
          <table className="table-auto text-sm w-full text-left">
            <tbody>
                <tr><td className="pr-4 py-1">Ações (total)</td><td>{formatNumber(stockData.sharesOutstanding, { notation: 'compact' })}</td></tr>
                <tr><td className="pr-4 py-1">FCF (12M)</td><td>{formatNumber(stockData.ttmFreeCashFlow, { style: 'currency', currency: 'BRL', notation: 'compact' })}</td></tr>
                <tr><td className="pr-4 py-1">Dívida Total</td><td>{formatNumber(stockData.totalDebt, { style: 'currency', currency: 'BRL', notation: 'compact' })}</td></tr>
                <tr><td className="pr-4 py-1">WACC (estim.)</td><td>{formatPercentage(stockData.estimatedWACC)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}