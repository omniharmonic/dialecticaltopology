# Epistemological Tree & System Improvements Design

**Date**: 2026-02-24
**Status**: Approved
**Author**: Claude (with user collaboration)

---

## Overview

This design document covers:
1. **Epistemological Tree** — A new visualization lens mapping claims to their philosophical roots
2. **Wiki Card System** — Lightweight reference cards for warrants, evidence, and concepts
3. **YouTube Timecode Links** — Clickable timestamps throughout the interface
4. **Component Fixes** — WorldviewMap dots, clickable claims, arena warrants, synthesis contrast

---

## 1. Epistemological Tree

### 1.1 Concept

An organic tree visualization that maps philosophical claims to their epistemological and ontological roots, revealing:
- The lineage of concepts and chain of thought
- Foundational worldview orientations
- Points of agreement, contradiction, and paradox
- Synthesis opportunities across speakers
- Communication barriers (semantic drift, framework incommensurability)

### 1.2 Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tree root structure | Abstract philosophical categories | Provides stable, philosophically grounded hierarchy |
| Relationship visualization | Cross-branch connections | Shows rich interconnections while maintaining tree structure |
| Communication barriers | Both semantic drift markers AND framework boundaries | Layered visualization captures terminology issues and deeper incompatibilities |
| Synthesis representation | Emergent synthesis nodes | Glowing convergence points where worldviews could integrate |
| Visual metaphor | Organic tree with bezier curves | Fits Turrell-inspired "Open Field" design system |
| Interactivity | Fully interactive (pan/zoom/expand) | Supports deep exploration |
| Technology | D3.js SVG | Already in stack, crisp at any zoom, accessible |

### 1.3 Tree Hierarchy

```
ROOT: "Philosophical Foundations"
├── EPISTEMOLOGY (How do we know?)
│   ├── Rationalism
│   │   └── Demartini claims (D03, D07, D12...)
│   └── Empiricism / Experiential
│       └── Marcus claims (M02, M08, M14...)
├── ONTOLOGY (What exists?)
│   ├── Monism / Non-duality
│   │   └── Demartini claims (D01, D04, D09...)
│   └── Dualism / Moral Realism
│       └── Marcus claims (M01, M05, M11...)
├── ETHICS (What should we do?)
│   ├── Consequentialist / Balance
│   │   └── Demartini claims
│   └── Deontological / Virtue
│       └── Marcus claims
└── METHODOLOGY (How do we transform?)
    ├── Technique-based
    │   └── Demartini claims
    └── Relationship-based
        └── Marcus claims
```

### 1.4 Data Model

**New file: `tree.json`**

```typescript
interface TreeData {
  nodes: TreeNode[];
  edges: TreeEdge[];
  synthesis_nodes: SynthesisNode[];
  semantic_drift: SemanticDrift[];
  framework_boundaries: FrameworkBoundary[];
}

interface TreeNode {
  id: string;
  type: 'root' | 'category' | 'branch' | 'claim' | 'synthesis';
  label: string;
  speaker?: 'marcus' | 'demartini' | 'shared';
  claim_id?: string;
  parent_id: string;
  depth: number;
  position?: { x: number; y: number };
}

interface TreeEdge {
  id: string;
  source: string;
  target: string;
  type: 'hierarchy' | 'agreement' | 'contradiction' | 'paradox' | 'tension';
  strength: number;
}

interface SynthesisNode {
  id: string;
  label: string;
  contributing_claims: string[];
  synthesis_text: string;
  position: { x: number; y: number };
}

interface SemanticDrift {
  term: string;
  marcus_meaning: string;
  demartini_meaning: string;
  affected_claims: string[];
}

interface FrameworkBoundary {
  speaker: 'marcus' | 'demartini';
  node_ids: string[];
  boundary_path: string;
}
```

### 1.5 Visual Design (Open Field Aligned)

**SVG Layer Structure:**
1. Framework boundaries (ambient fills at 20% opacity, no strokes)
2. Hierarchy branches (1px, `--border`, organic bezier curves)
3. Cross-branch connections (hidden by default, fade in on hover, 1px at 15-30% opacity)
4. Nodes (soft circles, no strokes, speaker colors)
5. Semantic drift markers (gold diamonds, rare)

**Color Mapping:**
| Element | CSS Variable | Usage |
|---------|--------------|-------|
| Marcus claims | `--marcus-soft` | Node fill at 80% opacity |
| Demartini claims | `--demartini-soft` | Node fill at 80% opacity |
| Synthesis nodes | `--convergence-soft` | Violet, earned appearance |
| Agreement edges | `--convergence` | 30% opacity |
| Tension edges | `--marcus` | 25% opacity |
| Paradox edges | `--insight` | 40% opacity, rare (3-5 max) |

**Selection State:**
- Ambient radial gradient behind node (speaker color at 10%, 48px diameter)
- No glow effects, no box-shadow
- Lineage path to root highlights

**Animation:**
- `--ease-resolve`: cubic-bezier(0.25, 0.1, 0.25, 1.0)
- `--duration-settle`: 350ms
- Elements "arrive", don't animate

### 1.6 Interactions

| Action | Result |
|--------|--------|
| Hover on node | Lineage highlights, connections fade in, label appears |
| Click claim node | Select, open DetailPanel below visualization |
| Click synthesis node | Show contributing claims and synthesis text |
| Hover on relationship edge | Tooltip explaining the relationship |
| Click semantic drift marker | Side-by-side definition comparison |
| Pinch/scroll | Zoom (0.5x to 3x) |
| Drag | Pan canvas |
| Click branch header | Collapse/expand children |

**Keyboard Navigation:**
- Tab: Move focus between nodes
- Enter/Space: Select focused node
- Arrow keys: Navigate tree structure
- +/-: Zoom
- 0: Reset zoom
- Escape: Deselect

---

## 2. Wiki Card System

### 2.1 Data Structure Extension

Extend `wiki_index.json`:

```typescript
interface WikiIndex {
  concepts: WikiEntry[];
  thinkers: WikiEntry[];
  frameworks: WikiEntry[];
  traditions: WikiEntry[];
  claims: WikiEntry[];
  // NEW
  warrants: WarrantEntry[];
  evidence: EvidenceEntry[];
}

interface WarrantEntry {
  id: string;
  text: string;
  type: 'logical' | 'empirical' | 'experiential' | 'authoritative';
  used_by: string[];
  strength: 'strong' | 'moderate' | 'weak';
}

interface EvidenceEntry {
  id: string;
  text: string;
  source_type: 'anecdote' | 'study' | 'authority' | 'example' | 'analogy';
  cited_by: string[];
  verifiable: boolean;
}
```

### 2.2 WikiCard Component

- Slides in from right (380px wide, per design system 5.5)
- Mobile: Bottom sheet (60vh max)
- Shows entry details + "Referenced in X claims" with navigation links
- Ghost button close or click outside to dismiss

### 2.3 Triggering

Wiki cards triggered by:
- Clicking warrant tags in SteelManArena
- Clicking related concepts in ClaimAtlas
- Clicking evidence citations
- Clicking thinker/framework references

---

## 3. YouTube Timecode Links

### 3.1 Link Format

```
https://www.youtube.com/watch?v={VIDEO_ID}&t={SECONDS}s
```

### 3.2 TimecodeLink Component

```tsx
function TimecodeLink({ seconds }: { seconds: number }) {
  const formatted = formatTime(seconds);
  const href = `https://www.youtube.com/watch?v=${VIDEO_ID}&t=${Math.floor(seconds)}s`;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="timecode-link">
      {formatted}
    </a>
  );
}
```

### 3.3 Styling

```css
.timecode-link {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--ink-tertiary);
  text-decoration: none;
}
.timecode-link:hover {
  color: var(--ink-secondary);
  text-decoration: underline dotted;
}
```

### 3.4 Locations to Update

- ClaimAtlas: Claim cards, detail panel
- DialecticalFlow: Phase tooltips, inflection points
- SemanticLandscape: Point tooltips
- SteelManArena: Exchange metadata (if applicable)

---

## 4. Component Fixes

### 4.1 WorldviewMap — Dot Positioning

**Problem:** Speaker dots clip below the spectrum line.

**Fix:** Center circles vertically on spectrum bar using `cy="50%"` or `cy={barHeight / 2}`.

### 4.2 Worldview Page — Clickable Claims

**Problem:** Referenced claims not navigable.

**Fix:** Create `ClaimReference` component that sets selected claim and navigates to Claims lens.

```tsx
function ClaimReference({ claimId }: { claimId: string }) {
  const { setSelectedClaim, setLens } = useAppStore();
  return (
    <button
      onClick={() => { setSelectedClaim(claimId); setLens('claims'); }}
      className="font-mono text-sm text-ink-tertiary hover:text-ink border-b border-dotted"
    >
      {claimId}
    </button>
  );
}
```

### 4.3 SteelManArena — Warrant Links

**Problem:** Warrants not linked to wiki cards.

**Fix:** Wrap warrants in clickable tags that open wiki panel.

### 4.4 Synthesis Section — Text Contrast

**Problem:** Orange text (`--insight`) on purple background (`--convergence`) fails contrast (1.8:1).

**Fix:**
- Background: `--convergence-soft` (light violet)
- Text: `--ink` (dark)
- Highlight: Use gold accent bar on left, not gold text

```css
.synthesis-insight {
  background: var(--convergence-soft);
  color: var(--ink);
}
.synthesis-insight-highlight {
  border-left: 3px solid var(--insight);
  padding-left: var(--space-4);
}
```

---

## 5. Technical Approach

- **Technology:** D3.js for tree (already in stack)
- **State:** Extend Zustand store with tree selection state
- **Data:** New `tree.json` file with curated mappings
- **Components:** New `EpistemologicalTree.tsx` lens, `WikiCard.tsx`, `TimecodeLink.tsx`, `ClaimReference.tsx`
- **Styling:** CSS variables from design system, no new tokens needed

---

## 6. Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Tree root structure? | Abstract philosophical categories |
| Relationship visualization? | Cross-branch connections |
| Synthesis representation? | Emergent synthesis nodes (violet) |
| Visual metaphor? | Organic tree with bezier curves |
| Wiki card depth? | Lightweight reference cards |

---

## 7. Success Criteria

1. Epistemological Tree renders with all 42 claims mapped to branches
2. Cross-branch connections visible on hover, correctly typed
3. Synthesis nodes appear where genuine convergence exists
4. Semantic drift markers highlight terminology conflicts
5. Framework boundaries subtly delineate speaker territories
6. All timecodes link to correct YouTube timestamps
7. Wiki cards open for warrants, evidence, concepts
8. WorldviewMap dots centered on spectrum
9. All claim references navigable
10. Synthesis text passes WCAG AA contrast

---

*Design approved 2026-02-24*
