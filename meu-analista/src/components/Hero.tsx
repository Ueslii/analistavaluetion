import React from 'react';

export default function Hero() {
  return (
    <section className="mb-20 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-text-primary">
        Desvende o Preço Justo das Ações
      </h1>
      <p className="text-lg text-text-secondary max-w-2xl mx-auto">
        Faça análises fundamentalistas complexas através de uma conversa simples e intuitiva.
      </p>
      <button className="bg-primary hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg mt-8 transition-colors duration-300">
        Começar Análise Agora
      </button>
    </section>
  );
}