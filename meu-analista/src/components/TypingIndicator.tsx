// src/components/TypingIndicator.tsx

import React from 'react';

export default function TypingIndicator() {
  return (
    // O Tailwind já tem uma animação 'animate-bounce' que cria o efeito de pulo
    <div className="flex gap-1.5 items-center">
      <span className="h-2 w-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
      <span className="h-2 w-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
      <span className="h-2 w-2 bg-white/50 rounded-full animate-bounce"></span>
    </div>
  );
}