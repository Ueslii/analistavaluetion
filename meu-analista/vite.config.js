import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Garante que apenas uma cópia do React seja usada, evitando conflitos
    dedupe: ['react', 'react-dom'], 
    
    // Cria um "atalho" direto para a pasta do React
    alias: {
      'react': path.resolve(__dirname, 'node_modules/react'),
    },
  },
})