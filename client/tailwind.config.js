/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#ecfeff',
          100: '#cffafe',
          300: '#7dd3fc',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        // アクセントは黄色トーンに（要望色の一つ）
        accent: {
          400: '#facc15',
          500: '#eab308',
        },
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(2,132,199,.25)',
        card: '0 6px 20px -10px rgba(17,24,39,.25)',
      },
      borderRadius: { xl2: '1.25rem' },
    },
  },
  plugins: [],
};
