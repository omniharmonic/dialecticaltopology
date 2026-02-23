# Open Field Design System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Dialectical Topology frontend from dark cyber aesthetic to the light, spacious "Open Field" design system.

**Architecture:** CSS-first migration using design tokens as the foundation. All colors, spacing, typography, and motion defined as CSS custom properties, extended through Tailwind. Components updated incrementally from foundation outward.

**Tech Stack:** Next.js 14, Tailwind CSS, Framer Motion, React Three Fiber, TypeScript

---

## Task 1: Download and Configure Self-Hosted Fonts

**Files:**
- Create: `frontend/public/fonts/` directory
- Create: `frontend/src/styles/fonts.css`

**Step 1: Download fonts**

Download from Google Fonts and place in `frontend/public/fonts/`:
- Inter: 300, 400, 500, 600 weights (woff2)
- Instrument Serif: Regular, Italic (woff2)
- JetBrains Mono: 400 (woff2)

Run:
```bash
cd "/Users/benjaminlife/iCloud Drive (Archive)/Documents/cursor projects/dialectical_topology/frontend"
mkdir -p public/fonts
```

**Step 2: Create fonts.css with @font-face declarations**

Create `frontend/src/styles/fonts.css`:

```css
/* Inter - Primary UI font */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('/fonts/Inter-Light.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/Inter-Medium.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/Inter-SemiBold.woff2') format('woff2');
}

/* Instrument Serif - Display font */
@font-face {
  font-family: 'Instrument Serif';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/InstrumentSerif-Regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Instrument Serif';
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/InstrumentSerif-Italic.woff2') format('woff2');
}

/* JetBrains Mono - Timestamps only */
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
}
```

**Step 3: Commit**

```bash
git add public/fonts src/styles/fonts.css
git commit -m "feat: add self-hosted fonts for Open Field design system"
```

---

## Task 2: Create Design Tokens CSS

**Files:**
- Create: `frontend/src/styles/design-tokens.css`

**Step 1: Create the design tokens file**

Create `frontend/src/styles/design-tokens.css`:

```css
:root {
  /* ========================================
     OPEN FIELD DESIGN SYSTEM TOKENS
     ======================================== */

  /* Background Field */
  --field: #FAFAFA;
  --field-subtle: #F5F4F2;
  --field-deep: #EFEEEC;

  /* Text (Ink) */
  --ink: #1A1A1A;
  --ink-secondary: #6B6B6B;
  --ink-tertiary: #A0A0A0;
  --ink-ghost: #C8C8C8;

  /* Speaker: Marcus (Warm) */
  --marcus: #C45A3C;
  --marcus-soft: #E8A892;
  --marcus-faint: #F5DED6;

  /* Speaker: Demartini (Cool) */
  --demartini: #2E6B8A;
  --demartini-soft: #8BBDD4;
  --demartini-faint: #D4E8F0;

  /* Semantic Accents */
  --convergence: #7B6FA0;
  --convergence-soft: #C4BEDD;
  --insight: #D4A853;

  /* System */
  --border: #E8E8E6;
  --border-active: #D0D0CC;
  --focus-ring: rgba(46, 107, 138, 0.2);

  /* Deep Field (3D canvas only) */
  --deep-start: #1A1A2E;
  --deep-mid: #16213E;
  --deep-end: #0F3460;

  /* ========================================
     SPACING SCALE
     ======================================== */
  --space-1: 0.25rem;   /*  4px */
  --space-2: 0.5rem;    /*  8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */

  /* ========================================
     TYPOGRAPHY SCALE (1.250 Major Third)
     ======================================== */
  --text-xs: 0.64rem;     /* 10.24px */
  --text-sm: 0.80rem;     /* 12.80px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.25rem;     /* 20px */
  --text-xl: 1.563rem;    /* 25px */
  --text-2xl: 1.953rem;   /* 31.25px */
  --text-3xl: 2.441rem;   /* 39.06px */
  --text-4xl: 3.052rem;   /* 48.83px */

  /* Line Heights */
  --leading-body: 1.65;
  --leading-heading: 1.2;
  --leading-mono: 1.4;

  /* ========================================
     MOTION
     ======================================== */
  --ease-resolve: cubic-bezier(0.25, 0.1, 0.25, 1.0);
  --ease-fade: cubic-bezier(0.4, 0.0, 0.2, 1.0);

  --duration-instant: 100ms;
  --duration-quick: 200ms;
  --duration-settle: 350ms;
  --duration-breathe: 600ms;
  --duration-resolve: 1000ms;

  /* ========================================
     LAYOUT
     ======================================== */
  --max-content: 1200px;
  --max-prose: 680px;
  --nav-height: 56px;
  --timeline-height: 48px;

  /* ========================================
     BREAKPOINTS (for reference)
     ======================================== */
  --bp-sm: 640px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
  --bp-2xl: 1536px;
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0ms;
    --duration-quick: 0ms;
    --duration-settle: 0ms;
    --duration-breathe: 0ms;
    --duration-resolve: 0ms;
  }
}
```

**Step 2: Commit**

```bash
git add src/styles/design-tokens.css
git commit -m "feat: add design tokens for Open Field system"
```

---

## Task 3: Update Tailwind Configuration

**Files:**
- Modify: `frontend/tailwind.config.ts`

**Step 1: Rewrite tailwind.config.ts to use design tokens**

Replace `frontend/tailwind.config.ts`:

```typescript
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
```

**Step 2: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: update Tailwind config with Open Field design tokens"
```

---

## Task 4: Rewrite Global Styles

**Files:**
- Modify: `frontend/src/app/globals.css`

**Step 1: Rewrite globals.css**

Replace `frontend/src/app/globals.css`:

```css
/* Design System Imports */
@import '../styles/fonts.css';
@import '../styles/design-tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ========================================
   BASE STYLES
   ======================================== */

html {
  color-scheme: light;
}

body {
  background: var(--field);
  color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: var(--text-base);
  line-height: var(--leading-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Selection */
::selection {
  background: var(--demartini-faint);
  color: var(--ink);
}

/* Focus ring for accessibility */
:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

/* ========================================
   SCROLLBAR (subtle)
   ======================================== */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--field-subtle);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-active);
}

/* ========================================
   GRADIENT FIELDS (Turrell-inspired)
   ======================================== */

.gradient-field-neutral {
  background: linear-gradient(
    180deg,
    var(--field) 0%,
    var(--field-subtle) 40%,
    var(--field-deep) 100%
  );
}

.gradient-field-marcus {
  background: linear-gradient(
    135deg,
    var(--field) 0%,
    #FBF5F2 50%,
    var(--marcus-faint) 100%
  );
}

.gradient-field-demartini {
  background: linear-gradient(
    135deg,
    var(--field) 0%,
    #F2F7FA 50%,
    var(--demartini-faint) 100%
  );
}

.gradient-field-convergence {
  background: linear-gradient(
    180deg,
    var(--field) 0%,
    #F0EDF5 50%,
    #E4DDEF 100%
  );
}

.gradient-field-deep {
  background: linear-gradient(
    180deg,
    var(--deep-start) 0%,
    var(--deep-mid) 50%,
    var(--deep-end) 100%
  );
}

/* ========================================
   TYPOGRAPHY UTILITIES
   ======================================== */

.font-display {
  font-family: 'Instrument Serif', Georgia, serif;
}

.font-display-italic {
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
}

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}

/* Max line length for readability */
.prose-width {
  max-width: var(--max-prose);
}

/* ========================================
   COMPONENT UTILITIES
   ======================================== */

/* Card base */
.card {
  background: var(--field-subtle);
  border-radius: 12px;
  padding: var(--space-6);
  transition: background var(--duration-instant) var(--ease-resolve);
}

.card:hover {
  background: var(--field-deep);
}

/* Speaker accent bar */
.accent-marcus {
  border-left: 3px solid var(--marcus);
}

.accent-demartini {
  border-left: 3px solid var(--demartini);
}

/* Filter pill */
.pill {
  background: var(--field-deep);
  color: var(--ink-secondary);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: var(--space-2) var(--space-4);
  border-radius: 100px;
  transition: all var(--duration-instant) var(--ease-resolve);
}

.pill:hover {
  background: var(--border-active);
}

.pill-active {
  background: var(--ink);
  color: var(--field);
}

/* Ghost button */
.btn-ghost {
  background: transparent;
  color: var(--ink-tertiary);
  padding: var(--space-2) var(--space-4);
  border-radius: 8px;
  transition: all var(--duration-instant) var(--ease-resolve);
}

.btn-ghost:hover {
  color: var(--ink-secondary);
  background: var(--field-subtle);
}

/* Primary button */
.btn-primary {
  background: var(--ink);
  color: var(--field);
  padding: var(--space-2) var(--space-4);
  border-radius: 8px;
  font-weight: 500;
  transition: opacity var(--duration-instant) var(--ease-resolve);
}

.btn-primary:hover {
  opacity: 0.85;
}

/* Secondary button */
.btn-secondary {
  background: transparent;
  color: var(--ink-secondary);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: all var(--duration-instant) var(--ease-resolve);
}

.btn-secondary:hover {
  background: var(--field-deep);
}

/* ========================================
   ANIMATION UTILITIES
   ======================================== */

.animate-reveal {
  animation: slide-up var(--duration-settle) var(--ease-resolve);
}

.animate-fade {
  animation: fade-in var(--duration-settle) var(--ease-fade);
}

/* ========================================
   CANVAS CONTAINER
   ======================================== */

.canvas-container {
  position: relative;
  width: 100%;
  min-height: 70vh;
  border-radius: 16px;
  overflow: hidden;
}

.canvas-deep {
  background: linear-gradient(
    180deg,
    var(--deep-start) 0%,
    var(--deep-mid) 50%,
    var(--deep-end) 100%
  );
  box-shadow: inset 0 2px 20px rgba(0, 0, 0, 0.1);
}
```

**Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: rewrite global styles for Open Field design system"
```

---

## Task 5: Update Layout Component

**Files:**
- Modify: `frontend/src/app/layout.tsx`

**Step 1: Read current layout**

Check current layout.tsx structure.

**Step 2: Update layout.tsx**

Update `frontend/src/app/layout.tsx` to remove any dark-mode classes and ensure proper meta tags:

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dialectical Topology',
  description: 'Exploring the hidden structure of philosophical debate',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-field text-ink">
        {children}
      </body>
    </html>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: update layout for Open Field design system"
```

---

## Task 6: Create Navigation Component

**Files:**
- Modify: `frontend/src/components/ui/Navigation.tsx`

**Step 1: Rewrite Navigation.tsx**

Replace `frontend/src/components/ui/Navigation.tsx`:

```tsx
'use client'

import { motion } from 'framer-motion'

type Lens = 'landscape' | 'claims' | 'flow' | 'worldviews' | 'arena'

const lenses: { id: Lens; label: string }[] = [
  { id: 'landscape', label: 'Landscape' },
  { id: 'claims', label: 'Claims' },
  { id: 'flow', label: 'Flow' },
  { id: 'worldviews', label: 'Worldviews' },
  { id: 'arena', label: 'Arena' },
]

interface NavigationProps {
  currentLens: Lens | null
  onSelectLens: (lens: Lens) => void
  onGoHome: () => void
  showHome?: boolean
}

export function Navigation({
  currentLens,
  onSelectLens,
  onGoHome,
  showHome = true
}: NavigationProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-[56px] bg-field/80 backdrop-blur-[12px]"
      style={{ height: 'var(--nav-height)' }}
    >
      <div className="max-w-content mx-auto h-full px-space-6 flex items-center justify-between">
        {/* Logo/Title */}
        <button
          onClick={onGoHome}
          className="font-display text-lg text-ink hover:text-ink-secondary transition-colors duration-instant"
        >
          Dialectical Topology
        </button>

        {/* Lens Tabs */}
        {currentLens && (
          <div className="flex items-center gap-space-1">
            {lenses.map((lens) => (
              <button
                key={lens.id}
                onClick={() => onSelectLens(lens.id)}
                className={`
                  relative px-space-4 py-space-2 text-sm font-medium
                  transition-colors duration-quick
                  ${currentLens === lens.id
                    ? 'text-ink'
                    : 'text-ink-secondary hover:text-ink'
                  }
                `}
              >
                {lens.label}
                {currentLens === lens.id && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-space-4 right-space-4 h-[2px] bg-ink"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Spacer for alignment when no tabs */}
        {!currentLens && <div />}
      </div>
    </nav>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/ui/Navigation.tsx
git commit -m "feat: update Navigation for Open Field design"
```

---

## Task 7: Create Timeline Bar Component

**Files:**
- Create: `frontend/src/components/ui/TimelineBar.tsx`

**Step 1: Create TimelineBar.tsx**

Create `frontend/src/components/ui/TimelineBar.tsx`:

```tsx
'use client'

import { useMemo } from 'react'

interface TimelineSegment {
  speaker: 'marcus' | 'demartini'
  start: number
  end: number
}

interface TimelineBarProps {
  segments: TimelineSegment[]
  totalDuration: number
  currentTime: number
  onSeek: (time: number) => void
  isPlaying?: boolean
  onPlayPause?: () => void
}

export function TimelineBar({
  segments,
  totalDuration,
  currentTime,
  onSeek,
  isPlaying = false,
  onPlayPause,
}: TimelineBarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (currentTime / totalDuration) * 100

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-field border-t border-border"
      style={{ height: 'var(--timeline-height)' }}
    >
      <div className="max-w-content mx-auto h-full px-space-6 flex items-center gap-space-4">
        {/* Play/Pause button */}
        {onPlayPause && (
          <button
            onClick={onPlayPause}
            className="btn-ghost w-8 h-8 flex items-center justify-center"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        )}

        {/* Speaker minimap */}
        <div
          className="flex-1 h-[4px] bg-field-deep rounded-full relative cursor-pointer overflow-hidden"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percent = x / rect.width
            onSeek(percent * totalDuration)
          }}
        >
          {/* Speaker segments */}
          {segments.map((seg, i) => {
            const left = (seg.start / totalDuration) * 100
            const width = ((seg.end - seg.start) / totalDuration) * 100
            return (
              <div
                key={i}
                className={`absolute top-0 h-full ${
                  seg.speaker === 'marcus'
                    ? 'bg-marcus-faint'
                    : 'bg-demartini-faint'
                }`}
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            )
          })}

          {/* Progress indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-ink rounded-full shadow-sm"
            style={{ left: `${progress}%`, marginLeft: '-6px' }}
          />
        </div>

        {/* Timestamp */}
        <span className="font-mono text-xs text-ink-tertiary min-w-[80px] text-right">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/ui/TimelineBar.tsx
git commit -m "feat: add TimelineBar component for temporal navigation"
```

---

## Task 8: Rewrite Landing Page

**Files:**
- Modify: `frontend/src/app/page.tsx`

**Step 1: Rewrite the landing page section**

This is a large file. Update the landing page components in `frontend/src/app/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Navigation } from '@/components/ui/Navigation'
import { useAppStore, Lens } from '@/store/appStore'
import { motion } from 'framer-motion'

// Dynamic imports for lens components
const SemanticLandscape = dynamic(
  () => import('@/components/lenses/SemanticLandscape').then((m) => m.SemanticLandscape),
  { ssr: false, loading: () => <LensLoader name="Semantic Landscape" /> }
)

const ClaimAtlas = dynamic(
  () => import('@/components/lenses/ClaimAtlas').then((m) => m.ClaimAtlas),
  { loading: () => <LensLoader name="Claim Atlas" /> }
)

const DialecticalFlow = dynamic(
  () => import('@/components/lenses/DialecticalFlow').then((m) => m.DialecticalFlow),
  { loading: () => <LensLoader name="Dialectical Flow" /> }
)

const WorldviewMap = dynamic(
  () => import('@/components/lenses/WorldviewMap').then((m) => m.WorldviewMap),
  { loading: () => <LensLoader name="Worldview Map" /> }
)

const SteelManArena = dynamic(
  () => import('@/components/lenses/SteelManArena').then((m) => m.SteelManArena),
  { loading: () => <LensLoader name="Steel Man Arena" /> }
)

function LensLoader({ name }: { name: string }) {
  return (
    <div className="min-h-screen pt-[var(--nav-height)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-border border-t-ink rounded-full animate-spin mx-auto mb-space-4" />
        <p className="text-ink-secondary">Loading {name}...</p>
      </div>
    </div>
  )
}

// Stats data
const STATS = [
  { value: '87', label: 'claims extracted' },
  { value: '11', label: 'dimensions of disagreement' },
  { value: '4', label: 'inflection points' },
  { value: '1', label: 'new synthesis generated' },
]

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-semibold text-ink mb-space-1">{value}</div>
      <div className="text-sm text-ink-secondary">{label}</div>
    </div>
  )
}

const LENS_PREVIEWS = [
  {
    id: 'landscape' as Lens,
    title: 'Semantic Landscape',
    description: 'Navigate a 3D space where ideas cluster by meaning, revealing hidden patterns in the conversation.',
  },
  {
    id: 'claims' as Lens,
    title: 'Claim Atlas',
    description: 'Explore every philosophical claim, see how speakers engage with each other\'s arguments.',
  },
  {
    id: 'worldviews' as Lens,
    title: 'Worldview Map',
    description: 'Compare how each speaker positions themselves on fundamental questions of reality and ethics.',
  },
  {
    id: 'flow' as Lens,
    title: 'Dialectical Flow',
    description: 'Watch the conversation unfold in time, with inflection points where it could have gone differently.',
  },
  {
    id: 'arena' as Lens,
    title: 'Steel Man Arena',
    description: 'Experience an AI-enhanced version where both positions are steel-manned to their strongest forms.',
  },
]

function LensPreviewCard({
  title,
  description,
  onClick,
}: {
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      className="card text-left group"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <h3 className="text-lg font-medium text-ink mb-space-2 group-hover:text-marcus transition-colors duration-instant">
        {title}
      </h3>
      <p className="text-sm text-ink-secondary leading-relaxed">{description}</p>
    </motion.button>
  )
}

function LandingPage({ onSelectLens }: { onSelectLens: (lens: Lens) => void }) {
  return (
    <div className="gradient-field-neutral min-h-screen">
      {/* Hero Section - 90vh */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-space-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-display-italic text-4xl md:text-4xl text-ink max-w-3xl mb-space-6"
        >
          What happens when two minds map the territory of evil?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-lg text-ink-secondary max-w-2xl mb-space-2"
        >
          An interactive exploration of the{' '}
          <span className="text-marcus">Aubrey Marcus</span>–
          <span className="text-demartini">Dr. John Demartini</span>{' '}
          debate on evil, nonduality, and moral knowledge.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-sm text-ink-tertiary mb-space-12"
        >
          Aubrey Marcus Podcast #521 · "No Such Thing As Evil"
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          onClick={() => onSelectLens('landscape')}
          className="btn-primary text-base px-space-8 py-space-3"
        >
          Begin exploring
        </motion.button>
      </section>

      {/* Stats Row */}
      <section className="py-space-16 px-space-6">
        <div className="max-w-content mx-auto">
          <div className="flex flex-wrap justify-center gap-space-12 md:gap-space-24">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <StatItem {...stat} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Orientation Text */}
      <section className="py-space-16 px-space-6">
        <div className="max-w-prose mx-auto text-center">
          <p className="text-base text-ink-secondary leading-relaxed mb-space-6">
            This project applies computational sense-making to a 1h 45m philosophical conversation.
            Using AI-assisted analysis, we've extracted claims, mapped worldviews, and traced the
            dialectical flow of ideas as two thinkers grapple with fundamental questions about
            the nature of evil.
          </p>
          <p className="text-base text-ink-secondary leading-relaxed">
            Navigate through five analytical lenses, each offering a different perspective
            on the same conversation. Discover where the speakers agree, where they genuinely
            disagree, and where their differences might be more semantic than substantive.
          </p>
        </div>
      </section>

      {/* Lens Preview Cards */}
      <section className="py-space-16 px-space-6">
        <div className="max-w-prose mx-auto">
          <h2 className="text-xl font-medium text-ink text-center mb-space-12">
            Five Analytical Lenses
          </h2>
          <div className="flex flex-col gap-space-6">
            {LENS_PREVIEWS.map((lens, i) => (
              <motion.div
                key={lens.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <LensPreviewCard
                  title={lens.title}
                  description={lens.description}
                  onClick={() => onSelectLens(lens.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-space-12 px-space-6 border-t border-border">
        <div className="max-w-content mx-auto text-center">
          <p className="text-sm text-ink-tertiary">
            Built with AI-assisted analysis · Part of the{' '}
            <span className="text-marcus">OpenCivics</span> sense-making toolkit
          </p>
        </div>
      </footer>
    </div>
  )
}

// Lens component mapping
const lensComponents: Record<Lens, React.ComponentType> = {
  landscape: SemanticLandscape,
  claims: ClaimAtlas,
  flow: DialecticalFlow,
  worldviews: WorldviewMap,
  arena: SteelManArena,
}

export default function Home() {
  const [activeLens, setActiveLens] = useState<Lens | null>(null)
  const { setLens } = useAppStore()

  const handleSelectLens = (lens: Lens) => {
    setActiveLens(lens)
    setLens(lens)
  }

  const handleGoHome = () => {
    setActiveLens(null)
  }

  // Show landing page if no lens selected
  if (!activeLens) {
    return (
      <main className="min-h-screen">
        <LandingPage onSelectLens={handleSelectLens} />
      </main>
    )
  }

  // Show the selected lens
  const LensComponent = lensComponents[activeLens]

  return (
    <main className="min-h-screen bg-field">
      <Navigation
        currentLens={activeLens}
        onSelectLens={handleSelectLens}
        onGoHome={handleGoHome}
      />
      <div className="pt-[var(--nav-height)]">
        <LensComponent />
      </div>
    </main>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: rewrite landing page for Open Field design"
```

---

## Task 9: Update Semantic Landscape Component

**Files:**
- Modify: `frontend/src/components/lenses/SemanticLandscape.tsx`

**Step 1: Update SemanticLandscape with new design**

This component keeps the dark canvas but updates styling for points, controls, and detail panels. Key changes:

- Points use `--marcus-soft` and `--demartini-soft` at 80% opacity
- Soft feathered edges (use sphere geometry with transparency)
- Selection creates soft radial glow, not ring
- Hybrid time control: minimal slider + discrete play button
- Detail panel appears below canvas with reveal animation

The full component update preserves 3D/4D functionality while applying Open Field styling to UI elements.

**Step 2: Commit**

```bash
git add src/components/lenses/SemanticLandscape.tsx
git commit -m "feat: update SemanticLandscape for Open Field design"
```

---

## Task 10: Update Claim Atlas Component

**Files:**
- Modify: `frontend/src/components/lenses/ClaimAtlas.tsx`

**Step 1: Update ClaimAtlas with new design**

Key changes:
- Single column, 680px max-width layout
- Cards with left accent bar for speaker
- Pill badges for engagement type
- Sticky filter row below navigation
- Expand/collapse for argument threads

**Step 2: Commit**

```bash
git add src/components/lenses/ClaimAtlas.tsx
git commit -m "feat: update ClaimAtlas for Open Field design"
```

---

## Task 11: Update Worldview Map Component

**Files:**
- Modify: `frontend/src/components/lenses/WorldviewMap.tsx`

**Step 1: Update WorldviewMap with spectrum bars**

Key changes:
- Full 1200px width horizontal spectrum bars
- 4px bar height with 12px position circles
- Gap badges with semantic colors
- Expandable analysis text below each dimension

**Step 2: Commit**

```bash
git add src/components/lenses/WorldviewMap.tsx
git commit -m "feat: update WorldviewMap for Open Field design"
```

---

## Task 12: Update Dialectical Flow Component

**Files:**
- Modify: `frontend/src/components/lenses/DialecticalFlow.tsx`

**Step 1: Update DialecticalFlow with horizontal timeline**

Key changes:
- Horizontal timeline-spiral layout, 60vh canvas
- 14px node circles with geometric type indicators
- Gold diamonds for inflection points
- Emotional intensity as subtle background wash

**Step 2: Commit**

```bash
git add src/components/lenses/DialecticalFlow.tsx
git commit -m "feat: update DialecticalFlow for Open Field design"
```

---

## Task 13: Update Steel Man Arena Component

**Files:**
- Modify: `frontend/src/components/lenses/SteelManArena.tsx`

**Step 1: Update SteelManArena with two-column layout**

Key changes:
- Two-column at desktop (960px max)
- Marcus column with `gradient-field-marcus`
- Demartini column with `gradient-field-demartini`
- Round navigation as step indicator
- Synthesis round uses full-width `gradient-field-convergence`

**Step 2: Commit**

```bash
git add src/components/lenses/SteelManArena.tsx
git commit -m "feat: update SteelManArena for Open Field design"
```

---

## Task 14: Final Integration & Testing

**Step 1: Run development server**

```bash
cd frontend && npm run dev
```

**Step 2: Test all pages**

- Landing page renders with new typography and spacing
- Navigation works with sliding indicator
- Each lens loads without errors
- Colors match design tokens
- Animations respect reduced-motion preference

**Step 3: Build for production**

```bash
npm run build
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Open Field design system implementation"
```

**Step 5: Push to remote**

```bash
git push origin main
```

---

## Summary

14 tasks total, following CSS-first migration approach:
1. Fonts setup
2. Design tokens
3. Tailwind config
4. Global styles
5. Layout
6. Navigation
7. Timeline bar
8. Landing page
9-13. Five lens components
14. Integration testing
