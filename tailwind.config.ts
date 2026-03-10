import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-bebas)', 'cursive'],
        body: ['var(--font-barlow)', 'sans-serif'],
      },
      colors: {
        fire: {
          50:  '#FFF1F0',
          100: '#FFE0DC',
          200: '#FFC5BD',
          300: '#FF9A8E',
          400: '#FF6B5B',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        ember: {
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
        },
        stone: {
          50:  '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0C0A09',
        }
      },
      backgroundImage: {
        'fire-grad': 'linear-gradient(135deg, #DC2626 0%, #EA580C 55%, #F59E0B 100%)',
        'fire-grad-r': 'linear-gradient(to right, #DC2626, #EA580C, #F59E0B)',
        'fire-subtle': 'linear-gradient(135deg, #FFF1F0 0%, #FFF7ED 100%)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.12)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      boxShadow: {
        'fire': '0 4px 20px rgba(220, 38, 38, 0.35)',
        'fire-lg': '0 8px 32px rgba(220, 38, 38, 0.45)',
        'glow': '0 0 20px rgba(234, 88, 12, 0.4)',
      }
    },
  },
  plugins: [],
}
export default config
