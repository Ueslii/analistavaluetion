/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    "/index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],},
    },
      colors: {         
        'background': '#0D1117',
        'background-pdf': '#11171F',
        'primary': '#10B981',
        'secondary': '#3B82F6',
        'text-primary': '#F1F5F9',
        'text-secondary': '#94A3B8',
      },
  },
  plugins: [],
}

