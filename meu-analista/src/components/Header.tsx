import React from 'react';

export default function Header() {
  return (
    <header className="w-full border-b border-white/10 p-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
      <div className="container mx-auto flex items-center justify-between">
        <p className="font-bold text-xl text-text-primary">Analista de Valuation </p>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#como-funciona" className="text-text-secondary hover:text-text-primary transition-colors hover:transforme hover:translate-y-0.5 ">Como Funciona</a>
          <a href="#sobre" className="text-text-secondary hover:text-text-primary transition-colors hover:transforme hover:translate-y-0.5">Sobre</a>
          <a href="#guia-pdf" className="font-bold text-primary hover:text-green-400 transition-colors hover:transforme hover:translate-y-0.5">Análise com PDF</a>
        </nav>
      </div>
    </header>
  );
}