# Epistemological Tree Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the Epistemological Tree visualization lens and related system improvements (wiki cards, YouTube links, component fixes).

**Architecture:** D3.js SVG tree with organic bezier curves, integrated with existing Zustand store and lens system. New `tree.json` data file maps claims to philosophical categories. Wiki cards use existing slide-over panel pattern.

**Tech Stack:** D3.js (existing), React 18, TypeScript, Tailwind CSS, Zustand, Framer Motion

---

## Phase 1: Foundation & Data

### Task 1: Add Tree Types to types.ts

**Files:**
- Modify: `frontend/src/lib/types.ts`

**Step 1: Add the tree data types at the end of the file**

```typescript
// Tree data (Epistemological Tree lens)
export interface TreeNode {
  id: string
  type: 'root' | 'category' | 'branch' | 'claim' | 'synthesis'
  label: string
  speaker?: 'marcus' | 'demartini' | 'shared'
  claim_id?: string
  parent_id: string | null
  depth: number
  position?: { x: number; y: number }
  collapsed?: boolean
}

export interface TreeEdge {
  id: string
  source: string
  target: string
  type: 'hierarchy' | 'agreement' | 'contradiction' | 'paradox' | 'tension'
  strength: number
}

export interface SynthesisNode {
  id: string
  label: string
  contributing_claims: string[]
  synthesis_text: string
  position: { x: number; y: number }
}

export interface SemanticDrift {
  term: string
  marcus_meaning: string
  demartini_meaning: string
  affected_claims: string[]
}

export interface FrameworkBoundary {
  speaker: 'marcus' | 'demartini'
  node_ids: string[]
}

export interface TreeData {
  metadata: {
    version: string
    total_nodes: number
    total_edges: number
  }
  nodes: TreeNode[]
  edges: TreeEdge[]
  synthesis_nodes: SynthesisNode[]
  semantic_drift: SemanticDrift[]
  framework_boundaries: FrameworkBoundary[]
}

// Wiki data extensions
export interface WarrantEntry {
  id: string
  text: string
  type: 'logical' | 'empirical' | 'experiential' | 'authoritative'
  used_by: string[]
  strength: 'strong' | 'moderate' | 'weak'
}

export interface EvidenceEntry {
  id: string
  text: string
  source_type: 'anecdote' | 'study' | 'authority' | 'example' | 'analogy'
  cited_by: string[]
  verifiable: boolean
}

export interface WikiIndex {
  concepts: { id: string; label: string; description: string }[]
  thinkers: { id: string; label: string; description: string }[]
  frameworks: { id: string; label: string; description: string }[]
  traditions: { id: string; label: string; description: string }[]
  warrants: WarrantEntry[]
  evidence: EvidenceEntry[]
}
```

**Step 2: Verify types compile**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add frontend/src/lib/types.ts
git commit -m "feat(types): add TreeData and WikiIndex types"
```

---

### Task 2: Create tree.json Data File

**Files:**
- Create: `frontend/public/data/tree.json`

**Step 1: Create the initial tree data structure**

This is a curated data file mapping existing claims to the philosophical tree. Create with seed data:

```json
{
  "metadata": {
    "version": "1.0.0",
    "total_nodes": 50,
    "total_edges": 60
  },
  "nodes": [
    { "id": "root", "type": "root", "label": "Philosophical Foundations", "parent_id": null, "depth": 0 },

    { "id": "epistemology", "type": "category", "label": "Epistemology", "parent_id": "root", "depth": 1 },
    { "id": "ontology", "type": "category", "label": "Ontology", "parent_id": "root", "depth": 1 },
    { "id": "ethics", "type": "category", "label": "Ethics", "parent_id": "root", "depth": 1 },
    { "id": "methodology", "type": "category", "label": "Methodology", "parent_id": "root", "depth": 1 },

    { "id": "rationalism", "type": "branch", "label": "Rationalism", "speaker": "demartini", "parent_id": "epistemology", "depth": 2 },
    { "id": "experientialism", "type": "branch", "label": "Experiential Knowing", "speaker": "marcus", "parent_id": "epistemology", "depth": 2 },

    { "id": "monism", "type": "branch", "label": "Non-duality / Monism", "speaker": "demartini", "parent_id": "ontology", "depth": 2 },
    { "id": "dualism", "type": "branch", "label": "Moral Realism", "speaker": "marcus", "parent_id": "ontology", "depth": 2 },

    { "id": "consequentialism", "type": "branch", "label": "Consequentialism", "speaker": "demartini", "parent_id": "ethics", "depth": 2 },
    { "id": "virtue-ethics", "type": "branch", "label": "Virtue Ethics", "speaker": "marcus", "parent_id": "ethics", "depth": 2 },

    { "id": "technique", "type": "branch", "label": "Technique-Based", "speaker": "demartini", "parent_id": "methodology", "depth": 2 },
    { "id": "relational", "type": "branch", "label": "Relationship-Based", "speaker": "marcus", "parent_id": "methodology", "depth": 2 },

    { "id": "D01", "type": "claim", "label": "Balance is universal law", "speaker": "demartini", "claim_id": "D01", "parent_id": "monism", "depth": 3 },
    { "id": "D03", "type": "claim", "label": "Evil is perception", "speaker": "demartini", "claim_id": "D03", "parent_id": "monism", "depth": 3 },
    { "id": "M01", "type": "claim", "label": "Evil has objective reality", "speaker": "marcus", "claim_id": "M01", "parent_id": "dualism", "depth": 3 },
    { "id": "M03", "type": "claim", "label": "Some acts are irredeemably wrong", "speaker": "marcus", "claim_id": "M03", "parent_id": "virtue-ethics", "depth": 3 }
  ],
  "edges": [
    { "id": "e1", "source": "root", "target": "epistemology", "type": "hierarchy", "strength": 1 },
    { "id": "e2", "source": "root", "target": "ontology", "type": "hierarchy", "strength": 1 },
    { "id": "e3", "source": "root", "target": "ethics", "type": "hierarchy", "strength": 1 },
    { "id": "e4", "source": "root", "target": "methodology", "type": "hierarchy", "strength": 1 },
    { "id": "e5", "source": "epistemology", "target": "rationalism", "type": "hierarchy", "strength": 1 },
    { "id": "e6", "source": "epistemology", "target": "experientialism", "type": "hierarchy", "strength": 1 },
    { "id": "e7", "source": "ontology", "target": "monism", "type": "hierarchy", "strength": 1 },
    { "id": "e8", "source": "ontology", "target": "dualism", "type": "hierarchy", "strength": 1 },
    { "id": "e9", "source": "ethics", "target": "consequentialism", "type": "hierarchy", "strength": 1 },
    { "id": "e10", "source": "ethics", "target": "virtue-ethics", "type": "hierarchy", "strength": 1 },
    { "id": "e11", "source": "methodology", "target": "technique", "type": "hierarchy", "strength": 1 },
    { "id": "e12", "source": "methodology", "target": "relational", "type": "hierarchy", "strength": 1 },
    { "id": "e13", "source": "monism", "target": "D01", "type": "hierarchy", "strength": 1 },
    { "id": "e14", "source": "monism", "target": "D03", "type": "hierarchy", "strength": 1 },
    { "id": "e15", "source": "dualism", "target": "M01", "type": "hierarchy", "strength": 1 },
    { "id": "e16", "source": "virtue-ethics", "target": "M03", "type": "hierarchy", "strength": 1 },
    { "id": "e17", "source": "D03", "target": "M01", "type": "contradiction", "strength": 0.9 },
    { "id": "e18", "source": "D01", "target": "M03", "type": "tension", "strength": 0.7 }
  ],
  "synthesis_nodes": [
    {
      "id": "syn1",
      "label": "Context-Dependent Morality",
      "contributing_claims": ["D03", "M01"],
      "synthesis_text": "Both perspectives may apply at different scales: individual perception shapes experience, while social structures create objective conditions.",
      "position": { "x": 0, "y": 0 }
    }
  ],
  "semantic_drift": [
    {
      "term": "balance",
      "marcus_meaning": "Equilibrium between opposing forces (good and evil exist separately)",
      "demartini_meaning": "Unity where apparent opposites are already integrated",
      "affected_claims": ["D01", "M01", "D03"]
    },
    {
      "term": "love",
      "marcus_meaning": "Emotional bond and care for specific beings",
      "demartini_meaning": "Recognition of wholeness; seeing balance in all things",
      "affected_claims": ["D07", "M05"]
    }
  ],
  "framework_boundaries": [
    { "speaker": "demartini", "node_ids": ["rationalism", "monism", "consequentialism", "technique", "D01", "D03"] },
    { "speaker": "marcus", "node_ids": ["experientialism", "dualism", "virtue-ethics", "relational", "M01", "M03"] }
  ]
}
```

**Step 2: Validate JSON syntax**

Run: `cd frontend && cat public/data/tree.json | python3 -m json.tool > /dev/null && echo "Valid JSON"`
Expected: "Valid JSON"

**Step 3: Commit**

```bash
git add frontend/public/data/tree.json
git commit -m "feat(data): add tree.json with philosophical hierarchy"
```

---

### Task 3: Add useTree Hook

**Files:**
- Modify: `frontend/src/lib/useData.ts`

**Step 1: Read the current useData.ts file**

Read: `frontend/src/lib/useData.ts`

**Step 2: Add the useTree hook following the existing pattern**

Add after the other hooks:

```typescript
import type { TreeData } from './types'

export function useTree() {
  const [data, setData] = useState<TreeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadJSON<TreeData>('tree.json')
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
```

**Step 3: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add frontend/src/lib/useData.ts
git commit -m "feat(hooks): add useTree data hook"
```

---

## Phase 2: Core Components

### Task 4: Create TimecodeLink Component

**Files:**
- Create: `frontend/src/components/ui/TimecodeLink.tsx`

**Step 1: Create the component file**

```tsx
'use client'

// YouTube video ID for Aubrey Marcus Podcast #521
const YOUTUBE_VIDEO_ID = 'YOUR_VIDEO_ID_HERE' // TODO: Replace with actual ID

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function TimecodeLink({ seconds }: { seconds: number }) {
  const formatted = formatTime(seconds)
  const href = `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}&t=${Math.floor(seconds)}s`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-xs text-ink-tertiary hover:text-ink-secondary hover:underline hover:decoration-dotted transition-colors"
    >
      {formatted}
    </a>
  )
}

export { formatTime }
```

**Step 2: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add frontend/src/components/ui/TimecodeLink.tsx
git commit -m "feat(ui): add TimecodeLink component for YouTube timestamps"
```

---

### Task 5: Create WikiCard Component

**Files:**
- Create: `frontend/src/components/ui/WikiCard.tsx`

**Step 1: Create the wiki card component**

```tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/appStore'

interface WikiCardProps {
  isOpen: boolean
  onClose: () => void
  type: 'concept' | 'thinker' | 'warrant' | 'evidence' | 'claim' | 'framework' | 'tradition'
  entry: {
    id: string
    label?: string
    text?: string
    description?: string
    used_by?: string[]
    cited_by?: string[]
    type?: string
    strength?: string
    source_type?: string
  } | null
}

export function WikiCard({ isOpen, onClose, type, entry }: WikiCardProps) {
  const { setSelectedClaim, setLens } = useAppStore()

  if (!entry) return null

  const handleClaimClick = (claimId: string) => {
    setSelectedClaim(claimId)
    setLens('claims')
    onClose()
  }

  const references = entry.used_by || entry.cited_by || []

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/[0.04] z-40"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="fixed right-0 top-0 w-[380px] h-full bg-field border-l border-border shadow-[-4px_0_24px_rgba(0,0,0,0.04)] z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-ink-tertiary">
                  {type}
                </span>
                <button
                  onClick={onClose}
                  className="text-ink-tertiary hover:text-ink-secondary transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Title */}
              <h2 className="text-lg font-medium text-ink mb-4">
                {entry.label || entry.text}
              </h2>

              {/* Description */}
              {entry.description && (
                <p className="text-sm text-ink-secondary leading-relaxed mb-4">
                  {entry.description}
                </p>
              )}

              {/* Type-specific metadata */}
              {type === 'warrant' && entry.type && (
                <div className="mb-4">
                  <span className="text-xs text-ink-tertiary">Type: </span>
                  <span className="text-xs text-ink-secondary capitalize">{entry.type}</span>
                  {entry.strength && (
                    <>
                      <span className="text-xs text-ink-tertiary"> · Strength: </span>
                      <span className="text-xs text-ink-secondary capitalize">{entry.strength}</span>
                    </>
                  )}
                </div>
              )}

              {type === 'evidence' && entry.source_type && (
                <div className="mb-4">
                  <span className="text-xs text-ink-tertiary">Source: </span>
                  <span className="text-xs text-ink-secondary capitalize">{entry.source_type}</span>
                </div>
              )}

              {/* References */}
              {references.length > 0 && (
                <section className="mt-6 pt-4 border-t border-border">
                  <h3 className="text-sm text-ink-secondary mb-3">
                    Referenced in {references.length} claim{references.length !== 1 ? 's' : ''}
                  </h3>
                  <ul className="space-y-2">
                    {references.map((claimId) => (
                      <li key={claimId}>
                        <button
                          onClick={() => handleClaimClick(claimId)}
                          className="text-sm font-mono text-ink-tertiary hover:text-ink transition-colors border-b border-dotted border-current"
                        >
                          {claimId}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
```

**Step 2: Create mobile-responsive styles**

The component uses Tailwind. For mobile bottom-sheet behavior, add to `globals.css`:

```css
/* Mobile wiki panel as bottom sheet */
@media (max-width: 768px) {
  .wiki-panel-mobile {
    width: 100%;
    height: auto;
    max-height: 60vh;
    top: auto;
    bottom: 0;
    border-left: none;
    border-top: 1px solid var(--border);
    border-radius: 16px 16px 0 0;
  }
}
```

**Step 3: Commit**

```bash
git add frontend/src/components/ui/WikiCard.tsx frontend/src/app/globals.css
git commit -m "feat(ui): add WikiCard slide-over panel component"
```

---

### Task 6: Create ClaimReference Component

**Files:**
- Create: `frontend/src/components/ui/ClaimReference.tsx`

**Step 1: Create the component**

```tsx
'use client'

import { useAppStore } from '@/store/appStore'

interface ClaimReferenceProps {
  claimId: string
  showPreview?: boolean
  preview?: string
}

export function ClaimReference({ claimId, showPreview = false, preview }: ClaimReferenceProps) {
  const { setSelectedClaim, setLens } = useAppStore()

  const handleClick = () => {
    setSelectedClaim(claimId)
    setLens('claims')
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 font-mono text-sm text-ink-tertiary hover:text-ink transition-colors border-b border-dotted border-current"
    >
      {claimId}
      {showPreview && preview && (
        <span className="font-sans text-xs text-ink-tertiary truncate max-w-[200px]">
          : {preview}
        </span>
      )}
    </button>
  )
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/ui/ClaimReference.tsx
git commit -m "feat(ui): add ClaimReference navigation component"
```

---

## Phase 3: Component Fixes

### Task 7: Fix WorldviewMap Dot Positioning

**Files:**
- Modify: `frontend/src/components/lenses/WorldviewMap.tsx:61-84`

**Step 1: Read the current implementation**

Read the DimensionSpectrum component around lines 60-85.

**Step 2: Fix the marker positioning**

Change the marker elements to use proper vertical centering. The issue is the markers need to be positioned relative to the track height. Replace:

```tsx
{/* Track */}
<div className="relative h-6 bg-field-deep rounded-full overflow-hidden">
  {/* Gap indicator */}
  <div
    className="absolute top-0 h-full bg-ink/5"
    style={{
      left: `${Math.min(demartiniPos, marcusPos)}%`,
      width: `${Math.abs(marcusPos - demartiniPos)}%`,
    }}
  />

  {/* Demartini marker - FIXED: use top-1/2 with proper transform */}
  <div
    className="absolute top-1/2 w-4 h-4 rounded-full bg-demartini border-2 border-field z-10"
    style={{
      left: `${demartiniPos}%`,
      transform: 'translate(-50%, -50%)'
    }}
  />

  {/* Marcus marker - FIXED: use top-1/2 with proper transform */}
  <div
    className="absolute top-1/2 w-4 h-4 rounded-full bg-marcus border-2 border-field z-10"
    style={{
      left: `${marcusPos}%`,
      transform: 'translate(-50%, -50%)'
    }}
  />
</div>
```

**Step 3: Verify visually**

Run: `cd frontend && npm run dev`
Navigate to WorldviewMap lens, verify dots are centered on the spectrum line.

**Step 4: Commit**

```bash
git add frontend/src/components/lenses/WorldviewMap.tsx
git commit -m "fix(worldview): center speaker dots on spectrum line"
```

---

### Task 8: Fix SteelManArena Insight Text Contrast

**Files:**
- Modify: `frontend/src/components/lenses/SteelManArena.tsx:86-91`

**Step 1: Find the insight styling**

The issue is at line 86-91 where insight uses `text-insight` (gold) on a colored background.

**Step 2: Fix the contrast**

Replace:

```tsx
{exchange.insight && (
  <div className="mt-3 p-2 bg-insight/20 rounded-lg">
    <p className="text-xs text-insight">
      <span className="font-medium">💡 Insight:</span> {exchange.insight}
    </p>
  </div>
)}
```

With:

```tsx
{exchange.insight && (
  <div className="mt-3 p-3 bg-field border-l-3 border-insight rounded-r-lg">
    <p className="text-xs text-ink-secondary">
      <span className="font-medium text-ink">💡 Insight:</span> {exchange.insight}
    </p>
  </div>
)}
```

**Step 3: Verify contrast**

Run: `cd frontend && npm run dev`
Navigate to SteelManArena, verify insight text is readable.

**Step 4: Commit**

```bash
git add frontend/src/components/lenses/SteelManArena.tsx
git commit -m "fix(arena): improve insight text contrast with accent bar"
```

---

### Task 9: Add Clickable Claims to WorldviewMap

**Files:**
- Modify: `frontend/src/components/lenses/WorldviewMap.tsx`

**Step 1: Import ClaimReference**

Add to imports:

```tsx
import { ClaimReference } from '@/components/ui/ClaimReference'
```

**Step 2: Find the detail panel section that shows key_claims**

Look for where `dimension.positions.marcus.key_claims` or similar is rendered.

**Step 3: Wrap claim IDs in ClaimReference**

Replace plain text claim IDs with:

```tsx
{dimension.positions.marcus.key_claims.map((id) => (
  <ClaimReference key={id} claimId={id} />
))}
```

**Step 4: Commit**

```bash
git add frontend/src/components/lenses/WorldviewMap.tsx
git commit -m "feat(worldview): make claim references clickable"
```

---

### Task 10: Add Warrant Links to SteelManArena

**Files:**
- Modify: `frontend/src/components/lenses/SteelManArena.tsx`

**Step 1: Add wiki state to component**

Add state for wiki panel:

```tsx
const [wikiOpen, setWikiOpen] = useState(false)
const [selectedWarrant, setSelectedWarrant] = useState<string | null>(null)
```

**Step 2: Create WarrantTag sub-component**

```tsx
function WarrantTag({ warrant, onClick }: { warrant: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs bg-field-deep hover:bg-field-subtle px-2 py-0.5 rounded text-ink-secondary transition-colors"
    >
      {warrant}
    </button>
  )
}
```

**Step 3: Replace warrant rendering in ExchangeBubble**

```tsx
{exchange.warrants.map((w, i) => (
  <WarrantTag
    key={i}
    warrant={w}
    onClick={() => {
      setSelectedWarrant(w)
      setWikiOpen(true)
    }}
  />
))}
```

**Step 4: Add WikiCard to the component**

Import and add at the bottom of the component return.

**Step 5: Commit**

```bash
git add frontend/src/components/lenses/SteelManArena.tsx
git commit -m "feat(arena): make warrants clickable with wiki panel"
```

---

### Task 11: Update ClaimAtlas with TimecodeLink

**Files:**
- Modify: `frontend/src/components/lenses/ClaimAtlas.tsx`

**Step 1: Import TimecodeLink**

```tsx
import { TimecodeLink } from '@/components/ui/TimecodeLink'
```

**Step 2: Replace formatTime calls with TimecodeLink**

In ClaimCard (around line 46):

```tsx
// Before
<span className="text-xs text-ink-tertiary">{formatTime(claim.timestamp)}</span>

// After
<TimecodeLink seconds={claim.timestamp} />
```

Also update the detail panel where timestamp is shown.

**Step 3: Commit**

```bash
git add frontend/src/components/lenses/ClaimAtlas.tsx
git commit -m "feat(claims): convert timestamps to YouTube links"
```

---

## Phase 4: Epistemological Tree Lens

### Task 12: Create EpistemologicalTree Component - Layout

**Files:**
- Create: `frontend/src/components/lenses/EpistemologicalTree.tsx`

**Step 1: Create the basic component structure**

```tsx
'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import { useTree, useClaims } from '@/lib/useData'
import { LensLayout, DetailPanel, SpeakerBadge } from './LensLayout'
import { ClaimReference } from '@/components/ui/ClaimReference'
import type { TreeNode, TreeEdge, SynthesisNode, SemanticDrift } from '@/lib/types'

// Design tokens for SVG
const COLORS = {
  marcus: '#C45A3C',
  marcusSoft: '#E8A892',
  marcusFaint: '#F5DED6',
  demartini: '#2E6B8A',
  demartiniSoft: '#8BBDD4',
  demartiniFaint: '#D4E8F0',
  convergence: '#7B6FA0',
  convergenceSoft: '#C4BEDD',
  insight: '#D4A853',
  border: '#E8E8E6',
  ink: '#1A1A1A',
  inkTertiary: '#A0A0A0',
}

export default function EpistemologicalTree() {
  const { data: treeData, loading: treeLoading, error: treeError } = useTree()
  const { data: claimsData } = useClaims()

  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<TreeNode | null>(null)
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })

  // Resize observer
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        const { width, height } = svgRef.current.parentElement.getBoundingClientRect()
        setDimensions({ width, height: Math.max(height, 600) })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  if (treeLoading) {
    return <LensLayout title="Epistemological Tree" subtitle="Loading..." loading />
  }

  if (treeError || !treeData) {
    return <LensLayout title="Epistemological Tree" subtitle="Error loading data" error={treeError} />
  }

  return (
    <LensLayout
      title="Epistemological Tree"
      subtitle="Mapping claims to their philosophical roots"
    >
      <div className="relative w-full" style={{ minHeight: '70vh' }}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full rounded-2xl"
          style={{ background: 'linear-gradient(180deg, #FAFAFA 0%, #F5F4F2 40%, #F0EFED 100%)' }}
        >
          {/* Tree will be rendered here by D3 */}
        </svg>
      </div>

      {/* Detail Panel */}
      {selectedNode && (
        <DetailPanel onClose={() => setSelectedNode(null)}>
          <TreeNodeDetail
            node={selectedNode}
            treeData={treeData}
            claimsData={claimsData}
          />
        </DetailPanel>
      )}
    </LensLayout>
  )
}

function TreeNodeDetail({
  node,
  treeData,
  claimsData
}: {
  node: TreeNode
  treeData: any
  claimsData: any
}) {
  const claim = claimsData?.claims.find((c: any) => c.id === node.claim_id)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {node.speaker && <SpeakerBadge speaker={node.speaker} />}
        <span className="text-xs uppercase tracking-wider text-ink-tertiary">
          {node.type}
        </span>
      </div>

      <h3 className="font-display text-lg text-ink">{node.label}</h3>

      {claim && (
        <div className="space-y-3">
          <p className="text-sm text-ink-secondary">{claim.text}</p>

          {claim.warrants?.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-ink-tertiary mb-2">Warrants</h4>
              <ul className="space-y-1">
                {claim.warrants.map((w: string, i: number) => (
                  <li key={i} className="text-xs text-ink-secondary">• {w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/lenses/EpistemologicalTree.tsx
git commit -m "feat(tree): create EpistemologicalTree component shell"
```

---

### Task 13: Implement D3 Tree Layout

**Files:**
- Modify: `frontend/src/components/lenses/EpistemologicalTree.tsx`

**Step 1: Add the D3 tree layout logic**

Add this inside the component, after the hooks:

```tsx
// Compute tree layout
const { nodes, links } = useMemo(() => {
  if (!treeData) return { nodes: [], links: [] }

  const { width, height } = dimensions
  const margin = { top: 40, right: 40, bottom: 40, left: 40 }

  // Build hierarchy from flat nodes
  const nodeMap = new Map(treeData.nodes.map((n: TreeNode) => [n.id, { ...n }]))
  const root = nodeMap.get('root')

  // Create D3 hierarchy
  const hierarchyData = d3.stratify<TreeNode>()
    .id(d => d.id)
    .parentId(d => d.parent_id)
    (treeData.nodes)

  // Create tree layout (radial-ish, growing upward)
  const treeLayout = d3.tree<TreeNode>()
    .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
    .separation((a, b) => (a.parent === b.parent ? 1.5 : 2))

  const treeRoot = treeLayout(hierarchyData)

  // Flip Y so root is at bottom
  const nodes = treeRoot.descendants().map(d => ({
    ...d.data,
    x: d.x + margin.left,
    y: height - margin.bottom - d.y, // Flip Y
  }))

  const links = treeRoot.links().map(l => ({
    source: { ...l.source.data, x: l.source.x + margin.left, y: height - margin.bottom - l.source.y },
    target: { ...l.target.data, x: l.target.x + margin.left, y: height - margin.bottom - l.target.y },
  }))

  return { nodes, links }
}, [treeData, dimensions])
```

**Step 2: Commit**

```bash
git add frontend/src/components/lenses/EpistemologicalTree.tsx
git commit -m "feat(tree): add D3 tree layout computation"
```

---

### Task 14: Render Tree Branches with Bezier Curves

**Files:**
- Modify: `frontend/src/components/lenses/EpistemologicalTree.tsx`

**Step 1: Add organic path generator function**

```tsx
function organicPath(source: { x: number; y: number }, target: { x: number; y: number }): string {
  const midY = (source.y + target.y) / 2
  const curve = (target.x - source.x) * 0.3

  return `M ${source.x} ${source.y}
          C ${source.x + curve} ${midY},
            ${target.x - curve} ${midY},
            ${target.x} ${target.y}`
}
```

**Step 2: Render the branches in SVG**

Inside the SVG element:

```tsx
{/* Hierarchy branches */}
<g className="hierarchy-edges">
  {links.map((link, i) => (
    <path
      key={i}
      d={organicPath(link.source, link.target)}
      fill="none"
      stroke={COLORS.border}
      strokeWidth={1}
      opacity={0.6}
    />
  ))}
</g>
```

**Step 3: Commit**

```bash
git add frontend/src/components/lenses/EpistemologicalTree.tsx
git commit -m "feat(tree): render organic bezier curve branches"
```

---

### Task 15: Render Tree Nodes

**Files:**
- Modify: `frontend/src/components/lenses/EpistemologicalTree.tsx`

**Step 1: Add node rendering function**

```tsx
function getNodeColor(node: TreeNode & { x: number; y: number }): string {
  if (node.type === 'synthesis') return COLORS.convergenceSoft
  if (node.speaker === 'marcus') return COLORS.marcusSoft
  if (node.speaker === 'demartini') return COLORS.demartiniSoft
  return '#E8E8E6' // field-deep for categories
}

function getNodeRadius(node: TreeNode): number {
  switch (node.type) {
    case 'root': return 20
    case 'category': return 14
    case 'branch': return 10
    case 'claim': return 8
    case 'synthesis': return 10
    default: return 8
  }
}
```

**Step 2: Add node elements to SVG**

```tsx
{/* Nodes */}
<g className="nodes">
  {nodes.map((node) => (
    <g key={node.id}>
      {/* Selection ambient */}
      {selectedNode?.id === node.id && (
        <circle
          cx={node.x}
          cy={node.y}
          r={24}
          fill={node.speaker === 'marcus' ? COLORS.marcus : COLORS.demartini}
          opacity={0.1}
        />
      )}

      {/* Node circle */}
      <circle
        cx={node.x}
        cy={node.y}
        r={getNodeRadius(node)}
        fill={getNodeColor(node)}
        opacity={hoveredNode?.id === node.id ? 1 : 0.8}
        style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
        onMouseEnter={() => setHoveredNode(node)}
        onMouseLeave={() => setHoveredNode(null)}
        onClick={() => setSelectedNode(node)}
      />

      {/* Label (visible for categories and on hover) */}
      {(node.type === 'category' || node.type === 'root' || hoveredNode?.id === node.id) && (
        <text
          x={node.x}
          y={node.y - getNodeRadius(node) - 8}
          textAnchor="middle"
          className="text-xs fill-ink-secondary pointer-events-none"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {node.label}
        </text>
      )}
    </g>
  ))}
</g>
```

**Step 3: Commit**

```bash
git add frontend/src/components/lenses/EpistemologicalTree.tsx
git commit -m "feat(tree): render interactive tree nodes"
```

---

### Task 16: Add Cross-Branch Relationship Edges

**Files:**
- Modify: `frontend/src/components/lenses/EpistemologicalTree.tsx`

**Step 1: Compute relationship edges**

```tsx
const relationshipEdges = useMemo(() => {
  if (!treeData || !nodes.length) return []

  const nodePositions = new Map(nodes.map(n => [n.id, { x: n.x, y: n.y }]))

  return treeData.edges
    .filter((e: TreeEdge) => e.type !== 'hierarchy')
    .map((e: TreeEdge) => ({
      ...e,
      sourcePos: nodePositions.get(e.source),
      targetPos: nodePositions.get(e.target),
    }))
    .filter((e: any) => e.sourcePos && e.targetPos)
}, [treeData, nodes])
```

**Step 2: Render relationship edges**

```tsx
function getEdgeColor(type: string): string {
  switch (type) {
    case 'agreement': return COLORS.convergence
    case 'contradiction': return COLORS.marcus
    case 'paradox': return COLORS.insight
    case 'tension': return COLORS.marcus
    default: return COLORS.border
  }
}

// In SVG, after hierarchy edges:
{/* Relationship edges (visible on hover) */}
<g
  className="relationship-edges"
  opacity={hoveredNode || selectedNode ? 0.4 : 0}
  style={{ transition: 'opacity 0.35s' }}
>
  {relationshipEdges
    .filter((e: any) =>
      hoveredNode?.id === e.source ||
      hoveredNode?.id === e.target ||
      selectedNode?.id === e.source ||
      selectedNode?.id === e.target
    )
    .map((e: any) => (
      <path
        key={e.id}
        d={organicPath(e.sourcePos, e.targetPos)}
        fill="none"
        stroke={getEdgeColor(e.type)}
        strokeWidth={1}
        opacity={e.strength}
      />
    ))}
</g>
```

**Step 3: Commit**

```bash
git add frontend/src/components/lenses/EpistemologicalTree.tsx
git commit -m "feat(tree): add cross-branch relationship edges"
```

---

### Task 17: Add Zoom and Pan

**Files:**
- Modify: `frontend/src/components/lenses/EpistemologicalTree.tsx`

**Step 1: Add D3 zoom behavior**

```tsx
useEffect(() => {
  if (!svgRef.current || !treeData) return

  const svg = d3.select(svgRef.current)
  const g = svg.select('g.tree-content')

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 3])
    .on('zoom', (event) => {
      g.attr('transform', event.transform.toString())
    })

  svg.call(zoom)

  // Reset zoom button handler
  const resetZoom = () => {
    svg.transition()
      .duration(600)
      .call(zoom.transform, d3.zoomIdentity)
  }

  return () => {
    svg.on('.zoom', null)
  }
}, [treeData])
```

**Step 2: Wrap all SVG content in a group**

```tsx
<svg ref={svgRef} ...>
  <g className="tree-content">
    {/* All tree elements go here */}
  </g>
</svg>
```

**Step 3: Add zoom controls UI**

```tsx
<div className="absolute top-4 right-4 flex gap-2">
  <button
    onClick={() => {/* zoom in */}}
    className="w-8 h-8 rounded bg-field-subtle hover:bg-field-deep flex items-center justify-center text-ink-secondary"
  >
    +
  </button>
  <button
    onClick={() => {/* zoom out */}}
    className="w-8 h-8 rounded bg-field-subtle hover:bg-field-deep flex items-center justify-center text-ink-secondary"
  >
    −
  </button>
  <button
    onClick={() => {/* reset */}}
    className="px-2 h-8 rounded bg-field-subtle hover:bg-field-deep text-xs text-ink-secondary"
  >
    Reset
  </button>
</div>
```

**Step 4: Commit**

```bash
git add frontend/src/components/lenses/EpistemologicalTree.tsx
git commit -m "feat(tree): add zoom and pan controls"
```

---

### Task 18: Register Tree Lens in Navigation

**Files:**
- Modify: `frontend/src/components/lenses/index.ts`
- Modify: `frontend/src/app/page.tsx`

**Step 1: Export from lenses index**

Add to `frontend/src/components/lenses/index.ts`:

```typescript
export { default as EpistemologicalTree } from './EpistemologicalTree'
```

**Step 2: Add to page.tsx lens mapping**

Find the lens components mapping and add:

```tsx
case 'tree':
  return <EpistemologicalTree />
```

**Step 3: Add to navigation**

Find where lens tabs are defined and add the tree lens.

**Step 4: Commit**

```bash
git add frontend/src/components/lenses/index.ts frontend/src/app/page.tsx
git commit -m "feat(nav): register Epistemological Tree lens"
```

---

## Phase 5: Data Curation

### Task 19: Complete tree.json Mappings

**Files:**
- Modify: `frontend/public/data/tree.json`

**Step 1: Map all 42 claims to tree branches**

This is a curation task. Review `claims.json` and assign each claim to the appropriate branch based on its `type` field and content.

**Step 2: Add all relationship edges**

Review the claims for contradictions, agreements, and paradoxes. Add edges to `tree.json`.

**Step 3: Add synthesis nodes**

Identify 3-5 potential synthesis points based on the `ontology.json` synthesis data.

**Step 4: Add semantic drift entries**

Review the debate for terms used differently by each speaker.

**Step 5: Commit**

```bash
git add frontend/public/data/tree.json
git commit -m "feat(data): complete tree.json claim mappings"
```

---

### Task 20: Extend wiki_index.json

**Files:**
- Modify: `frontend/public/data/wiki_index.json`

**Step 1: Extract unique warrants from claims.json**

Create warrant entries with `used_by` references.

**Step 2: Extract unique evidence from claims.json**

Create evidence entries with `cited_by` references.

**Step 3: Commit**

```bash
git add frontend/public/data/wiki_index.json
git commit -m "feat(data): add warrants and evidence to wiki index"
```

---

## Phase 6: Testing & Polish

### Task 21: Visual Testing

**Step 1: Run dev server**

```bash
cd frontend && npm run dev
```

**Step 2: Test each lens**

- [ ] ClaimAtlas: Verify TimecodeLinks work
- [ ] WorldviewMap: Verify dots are centered, claims clickable
- [ ] SteelManArena: Verify insight contrast, warrant links
- [ ] EpistemologicalTree: Verify tree renders, interactions work

**Step 3: Test responsive behavior**

- [ ] Mobile viewport
- [ ] Tablet viewport
- [ ] Desktop viewport

---

### Task 22: Build and Deploy

**Step 1: Build static export**

```bash
cd frontend && npm run build
```

**Step 2: Verify build succeeds**

Expected: No errors, `out/` directory populated

**Step 3: Commit any build fixes**

**Step 4: Push to deploy**

```bash
git push origin main
```

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 1-3 | Data model & hooks |
| 2 | 4-6 | Shared UI components |
| 3 | 7-11 | Bug fixes & improvements |
| 4 | 12-18 | Epistemological Tree lens |
| 5 | 19-20 | Data curation |
| 6 | 21-22 | Testing & deployment |

Total: 22 tasks across 6 phases.
