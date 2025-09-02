// src/components/DataPanelSkeleton.tsx

import React from 'react';

export default function DataPanelSkeleton() {
  return (
    // Usamos a classe 'animate-pulse' do Tailwind para o efeito de carregamento
    <div className="border border-white/10 rounded-lg p-6 h-[70vh] flex flex-col animate-pulse">
      <div className="border-b border-white/10 pb-4 mb-4">
        <div className="h-8 bg-white/10 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-2/3"></div>
      </div>
      <div className="mb-6">
        <div className="h-12 bg-white/10 rounded w-1/2"></div>
      </div>
      <div>
        <div className="h-6 bg-white/10 rounded w-1/2 mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded"></div>
          <div className="h-4 bg-white/10 rounded"></div>
          <div className="h-4 bg-white/10 rounded"></div>
        </div>
      </div>
    </div>
  );
}