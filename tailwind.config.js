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
          primary:   '#082F49',
          secondary: '#0F766E',
          accent:    '#F97316',
          bg:        '#FFF7ED',
          text:      '#111827',
        },
        coral: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'pattern-dots': 'radial-gradient(circle, currentColor 1px, transparent 1px)',
      },
    },
  },
  safelist: [
    'bg-teal-500', 'bg-teal-600',
    'bg-emerald-500',
    'bg-blue-500',
    'bg-violet-500',
    'bg-orange-400',
    'bg-amber-500',
    'bg-rose-500',
    'bg-coral-500',
    'bg-slate-500', 'bg-slate-600',
  ],
  plugins: [],
}

