/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#080B12',
          surface: '#0D1120',
          elevated: '#111829',
          border: '#1E2535',
          muted: '#8892A4',
        },
        indigo: {
          900: '#1a1f3a',
          700: '#2D3FCC',
          500: '#4361EE',
          400: '#7B8FF7',
          200: '#A8B5FF',
        },
        teal: {
          900: '#0a1a14',
          700: '#0B7A52',
          500: '#20C997',
          300: '#6EEAC5',
          100: '#A8FFE2',
        },
        gold: {
          900: '#1a1205',
          700: '#8A5E0A',
          500: '#F0A500',
          300: '#FFD166',
          100: '#FFE9A8',
        },
        alert: {
          900: '#1a0a08',
          700: '#8A2E1A',
          500: '#E63946',
          300: '#FF7B84',
          100: '#FFBDC0',
        },
        silver: {
          400: '#B4B2A9',
          700: '#2a2a35',
        },
      },

      fontFamily: {
        sans: ['DM Sans', 'System', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },

      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '18px',
        xl: '24px',
        full: '9999px',
      },
    },
  },
};
