import React from 'react';

export default function Header() {
  return (
    <header className="w-full border-b border-white/10 p-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
      <div className="container mx-auto">
        <p className="font-bold text-xl text-text-primary">Analista de Valuation </p>
      </div>
    </header>
  );
}