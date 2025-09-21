import React from 'react';

export default function Header() {
  return (
    <header className="w-full border-b border-white/10 p-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <p className="font-bold text-xl text-text-primary">Analista de Valuation </p>
        <nav className="flex items-center gap-x-6 text-sm">
          <a href="#sobre" className="text-text-secondary hover:text-text-primary transition-colors hover:transforme hover:translate-y-0.5">Sobre</a>
          <a href="#como-funciona" className="text-text-secondary hover:text-text-primary transition-colors hover:transforme hover:translate-y-0.5 ">Como Funciona</a>
          <a href="#guia-pdf" className="font-bold text-primary hover:text-green-400 transition-colors hover:transforme hover:translate-y-0.5">Análise com PDF</a>
          <a href="#aviso" className="text-text-secondary hover:text-text-primary transition-colors hover:transforme hover:translate-y-0.5">Aviso</a>
        </nav>
      </div>
    </header>
  );
}