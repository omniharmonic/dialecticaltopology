# Open Field Design System Implementation

**Date:** 2026-02-23
**Status:** Approved
**Approach:** CSS-First Migration (Approach A)

## Overview

Transform the Dialectical Topology frontend from a dark-mode cyber aesthetic to the "Open Field" design system inspired by James Turrell installations. The new design emphasizes spaciousness, light, and clarity through calm.

## Key Decisions

- **Scope:** Full implementation of all design system elements
- **Fonts:** Self-hosted (Inter, Instrument Serif, JetBrains Mono)
- **3D Controls:** Hybrid approach - minimal time slider with discrete play button
- **Implementation Order:** Foundation → Landing → Navigation → Lenses → Timeline

## Design Tokens

### Colors

```
Background Field:
  --field:          #FAFAFA    Primary ground
  --field-subtle:   #F5F4F2    Secondary surfaces
  --field-deep:     #EFEEEC    Tertiary/hover

Text (Ink):
  --ink:            #1A1A1A    Primary text
  --ink-secondary:  #6B6B6B    Secondary/labels
  --ink-tertiary:   #A0A0A0    Timestamps
  --ink-ghost:      #C8C8C8    Disabled/placeholder

Speaker Voices:
  --marcus:         #C45A3C    Warm terracotta
  --marcus-soft:    #E8A892    Light wash
  --marcus-faint:   #F5DED6    Ambient tint

  --demartini:      #2E6B8A    Deep teal-blue
  --demartini-soft: #8BBDD4    Light wash
  --demartini-faint:#D4E8F0    Ambient tint

Semantic:
  --convergence:      #7B6FA0    Synthesis zones
  --convergence-soft: #C4BEDD    Light wash
  --insight:          #D4A853    Inflection points (rare)

System:
  --border:         #E8E8E6    Structural lines
  --border-active:  #D0D0CC    Active borders
  --focus-ring:     #2E6B8A33  Focus accessibility
```

### Typography

```
Typefaces:
  Primary:  Inter (300, 400, 500, 600)
  Display:  Instrument Serif (400, 400 Italic)
  Mono:     JetBrains Mono (400)

Scale (1.250 ratio):
  --text-xs:   0.64rem / 10.24px
  --text-sm:   0.80rem / 12.80px
  --text-base: 1.00rem / 16.00px
  --text-lg:   1.25rem / 20.00px
  --text-xl:   1.563rem / 25.00px
  --text-2xl:  1.953rem / 31.25px
  --text-3xl:  2.441rem / 39.06px
  --text-4xl:  3.052rem / 48.83px

Line Heights:
  Body: 1.65
  Headers: 1.2
  Mono: 1.4
```

### Spacing

```
--space-1:   0.25rem /   4px
--space-2:   0.5rem  /   8px
--space-3:   0.75rem /  12px
--space-4:   1rem    /  16px
--space-6:   1.5rem  /  24px
--space-8:   2rem    /  32px
--space-12:  3rem    /  48px
--space-16:  4rem    /  64px
--space-24:  6rem    /  96px
--space-32:  8rem    / 128px
```

### Motion

```
Easing:
  --ease-resolve: cubic-bezier(0.25, 0.1, 0.25, 1.0)
  --ease-fade:    cubic-bezier(0.4, 0.0, 0.2, 1.0)

Durations:
  --duration-instant:  100ms
  --duration-quick:    200ms
  --duration-settle:   350ms
  --duration-breathe:  600ms
  --duration-resolve: 1000ms
```

## Component Architecture

### Navigation
- Sticky top, 56px height
- Background: `--field` with blur(12px) backdrop
- Tabs: Inter Medium, `--text-sm`, 2px bottom indicator
- Indicator slides between tabs (200ms ease)

### Timeline Bar
- Fixed bottom, 48px height
- Speaker segment minimap with faint colors
- JetBrains Mono timestamp
- Hidden on landing page, visible on lens pages

### Cards
- Background: `--field-subtle`
- No border, 12px radius
- Padding: `--space-6`
- Hover: background shifts to `--field-deep`
- Active: 3px left accent bar (speaker color)

### Detail Panel
- No container - appears in reading flow
- Animation: fade in + translateY(8px) over 350ms
- 1px `--border` separator above with `--space-12` padding

## Page Layouts

### Landing Page
1. Hero (90vh) - Instrument Serif Italic headline, radial gradient
2. Stats row - 4 numbers, Inter Semibold, no decoration
3. Orientation text - 680px centered
4. Lens previews - vertical stack, `--field-subtle` cards
5. Footer - methodology, credits

### Lens Pages
- Scroll-through reading model (not dashboard)
- Visualization canvases: minimum 70vh
- Analysis text: 680px max-width column
- Max content width: 1200px

## Visualization Specifications

### Semantic Landscape (3D)
- Canvas: `--gradient-field-deep` (dark exception)
- Points: soft circles, feathered edges, 80% opacity
- Selection: soft radial glow (10% speaker color, 40px radius)
- Time slider: minimal + discrete play button

### Claim Atlas
- Single column, 680px max-width
- Cards with left accent bar for speaker
- Engagement type as small pill badges
- Sticky filter row below navigation

### Worldview Map
- Full 1200px width
- Spectrum bars: 4px height, `--field-deep` background
- Position circles: 12px, speaker colors
- Gap badges below bars with semantic colors

### Dialectical Flow
- Horizontal timeline, 60vh canvas
- Nodes: 14px circles with geometric type indicators
- Inflection points: gold diamonds (--insight)
- Emotional intensity: subtle background wash

### Steel Man Arena
- Two-column at desktop, 960px max
- Marcus column: `--gradient-field-marcus`
- Demartini column: `--gradient-field-demartini`
- Synthesis: full-width `--gradient-field-convergence`

## Files to Create/Modify

### New Files
- `frontend/src/styles/design-tokens.css`
- `frontend/src/styles/fonts.css`
- `frontend/public/fonts/` (Inter, Instrument Serif, JetBrains Mono)
- `frontend/src/components/ui/TimelineBar.tsx`

### Modified Files
- `frontend/tailwind.config.ts`
- `frontend/src/app/globals.css`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/components/ui/Navigation.tsx`
- `frontend/src/components/lenses/SemanticLandscape.tsx`
- `frontend/src/components/lenses/ClaimAtlas.tsx`
- `frontend/src/components/lenses/WorldviewMap.tsx`
- `frontend/src/components/lenses/DialecticalFlow.tsx`
- `frontend/src/components/lenses/SteelManArena.tsx`

## Accessibility Requirements

- WCAG 2.1 AA compliance
- All interactive elements keyboard-navigable
- Focus states visible (`--focus-ring`)
- Color never sole means of information
- `prefers-reduced-motion` support

## Success Criteria

1. Light, spacious aesthetic matching Turrell inspiration
2. All design tokens properly cascading through components
3. Smooth transitions respecting motion preferences
4. Readable text at all sizes with proper contrast
5. 3D landscape maintains dark canvas while rest is light
6. Timeline bar provides temporal orientation
