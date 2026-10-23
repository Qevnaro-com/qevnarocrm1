/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#091744',
          'navy-dark': '#060e2b',
          'navy-light': '#122564',
          accent: '#2977FD',
          'accent-hover': '#1b64e5',
          'accent-light': '#EBF2FF',
          bg: '#F5F7FB',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        qevnaro: {
          50: '#F0F5FF',
          100: '#E1ECFE',
          200: '#C7DAFE',
          300: '#9EBEFD',
          400: '#6898FC',
          500: '#2977FD',
          600: '#1A5CD6',
          700: '#1446A3',
          800: '#133B85',
          900: '#091744',
          950: '#050D28',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(9, 23, 68, 0.08), 0 2px 6px -1px rgba(9, 23, 68, 0.04)',
        'brand-lg': '0 10px 25px -3px rgba(9, 23, 68, 0.12), 0 4px 10px -2px rgba(9, 23, 68, 0.06)',
        'accent-glow': '0 0 20px -3px rgba(41, 119, 253, 0.35)',
      }
    },
  },
  plugins: [],
}
