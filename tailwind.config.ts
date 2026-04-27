import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        abyss: '#050505',
        'emerald-glow': '#10B981',
        'emerald-dim': '#059669',
        'mystic-gold': '#C9A96E',
        'mystic-gold-light': '#E8C98A',
        'card-bg': '#0D1117',
        'glass-border': 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'emerald-gradient': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C9A96E 0%, #E8C98A 50%, #C9A96E 100%)',
        'mystic-gradient': 'linear-gradient(180deg, #050505 0%, #0a0f1e 50%, #050505 100%)',
      },
      animation: {
        breathe: 'breathe 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        twinkle: 'twinkle 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(16,185,129,0.3), 0 0 20px rgba(16,185,129,0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(16,185,129,0.6), 0 0 50px rgba(16,185,129,0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} satisfies Config
