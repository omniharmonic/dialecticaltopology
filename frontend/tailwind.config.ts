import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Lucid Consciousness palette
        void: {
          DEFAULT: '#0a0a0f',
          50: '#12121a',
          100: '#1a1a25',
          200: '#252530',
        },
        marcus: {
          DEFAULT: '#d4af37', // Gold
          light: '#f4d77a',
          dark: '#a68929',
          glow: 'rgba(212, 175, 55, 0.4)',
        },
        demartini: {
          DEFAULT: '#2dd4bf', // Teal
          light: '#5eead4',
          dark: '#14b8a6',
          glow: 'rgba(45, 212, 191, 0.4)',
        },
        accent: {
          purple: '#a855f7',
          blue: '#3b82f6',
          rose: '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-marcus': '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-demartini': '0 0 20px rgba(45, 212, 191, 0.3)',
      },
    },
  },
  plugins: [],
}

export default config
