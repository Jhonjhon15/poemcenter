/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#0a0806',
          900: '#0f0c0a',
          800: '#171219',
          700: '#1c1620',
        },
        wood: {
          900: '#171008',
          800: '#241d14',
          700: '#3b2e1e',
          600: '#4e3a22',
          500: '#6b5c44',
        },
        gold: {
          400: '#e3c778',
          500: '#d4af37',
          600: '#c9a227',
        },
        cream: {
          100: '#f2e8d2',
          200: '#e0d2b4',
          300: '#c2ae8b',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.9s cubic-bezier(0.16,1,0.3,1) both',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
