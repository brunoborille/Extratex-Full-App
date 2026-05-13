/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        copper: {
          50: '#fdf6ee',
          100: '#f9e8d0',
          200: '#f3cd9f',
          300: '#ecac6d',
          400: '#e48940',
          500: '#dc6b1e',
          600: '#cd5214',
          700: '#aa3c13',
          800: '#883117',
          900: '#6f2a16',
        },
        navy: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#bdd0ff',
          300: '#90aaff',
          400: '#6381fb',
          500: '#4259f6',
          600: '#2c3aeb',
          700: '#2230d8',
          800: '#2229ae',
          900: '#1e2589',
          950: '#141654',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'count-up': 'countUp 0.6s ease-out',
        'bar-grow': 'barGrow 0.8s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        barGrow: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-width)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'copper-shimmer': 'linear-gradient(90deg, transparent, rgba(212,130,44,0.15), transparent)',
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(0,0,0,0.08), 0 4px 16px -4px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px -4px rgba(0,0,0,0.12), 0 4px 8px -4px rgba(0,0,0,0.06)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.25)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.25)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.25)',
        'inner-sm': 'inset 0 1px 3px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
