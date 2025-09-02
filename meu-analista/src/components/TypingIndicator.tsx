// src/components/TypingIndicator.tsx
import React from 'react';

export default function TypingIndicator() {
  // Usamos a animação 'animate-bounce' padrão do Tailwind com delays diferentes
  return (
    <div className="flex gap-1.5 items-center p-2">
      <span className="h-2 w-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
      <span className="h-2 w-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
      <span className="h-2 w-2 bg-white/50 rounded-full animate-bounce"></span>
    </div>
  );
}