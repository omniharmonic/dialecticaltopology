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
        // Field (backgrounds)
        field: {
          DEFAULT: 'var(--field)',
          subtle: 'var(--field-subtle)',
          deep: 'var(--field-deep)',
        },
        // Ink (text)
        ink: {
          DEFAULT: 'var(--ink)',
          secondary: 'var(--ink-secondary)',
          tertiary: 'var(--ink-tertiary)',
          ghost: 'var(--ink-ghost)',
        },
        // Speakers
        marcus: {
          DEFAULT: 'var(--marcus)',
          soft: 'var(--marcus-soft)',
          faint: 'var(--marcus-faint)',
        },
        demartini: {
          DEFAULT: 'var(--demartini)',
          soft: 'var(--demartini-soft)',
          faint: 'var(--demartini-faint)',
        },
        // Semantic
        convergence: {
          DEFAULT: 'var(--convergence)',
          soft: 'var(--convergence-soft)',
        },
        insight: 'var(--insight)',
        // System
        border: {
          DEFAULT: 'var(--border)',
          active: 'var(--border-active)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: ['var(--text-xs)', { lineHeight: 'var(--leading-mono)' }],
        sm: ['var(--text-sm)', { lineHeight: 'var(--leading-body)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--leading-body)' }],
        lg: ['var(--text-lg)', { lineHeight: 'var(--leading-body)' }],
        xl: ['var(--text-xl)', { lineHeight: 'var(--leading-heading)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-heading)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-heading)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-heading)' }],
      },
      spacing: {
        'space-1': 'var(--space-1)',
        'space-2': 'var(--space-2)',
        'space-3': 'var(--space-3)',
        'space-4': 'var(--space-4)',
        'space-6': 'var(--space-6)',
        'space-8': 'var(--space-8)',
        'space-12': 'var(--space-12)',
        'space-16': 'var(--space-16)',
        'space-24': 'var(--space-24)',
        'space-32': 'var(--space-32)',
      },
      maxWidth: {
        content: 'var(--max-content)',
        prose: 'var(--max-prose)',
      },
      transitionTimingFunction: {
        resolve: 'var(--ease-resolve)',
        fade: 'var(--ease-fade)',
      },
      transitionDuration: {
        instant: 'var(--duration-instant)',
        quick: 'var(--duration-quick)',
        settle: 'var(--duration-settle)',
        breathe: 'var(--duration-breathe)',
      },
      borderRadius: {
        card: '12px',
      },
      animation: {
        'fade-in': 'fade-in var(--duration-settle) var(--ease-fade)',
        'slide-up': 'slide-up var(--duration-settle) var(--ease-resolve)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
