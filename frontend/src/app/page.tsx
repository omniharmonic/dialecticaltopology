'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Navigation } from '@/components/ui/Navigation'
import { useAppStore, Lens } from '@/store/appStore'
import { motion } from 'framer-motion'

// Dynamic imports for lens components (avoid SSR issues with Three.js)
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
    <div className="min-h-screen pt-space-16 flex items-center justify-center gradient-field-neutral">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-ink-ghost border-t-ink rounded-full animate-spin mx-auto mb-space-4" />
        <p className="text-ink-secondary">Loading {name}...</p>
      </div>
    </div>
  )
}

// Stats for landing page
const STATS = [
  { value: '87', label: 'claims extracted' },
  { value: '11', label: 'dimensions of disagreement' },
  { value: '4', label: 'inflection points' },
  { value: '1', label: 'new synthesis generated' },
]

// Lens previews data - explicitly typed for type safety
const LENS_PREVIEWS: { id: Lens; title: string; description: string }[] = [
  {
    id: 'landscape',
    title: 'Semantic Landscape',
    description: 'Navigate a 3D space where ideas cluster by meaning, revealing hidden patterns in the conversation.',
  },
  {
    id: 'claims',
    title: 'Claim Atlas',
    description: 'Explore every philosophical claim, see how speakers engage with each other\'s arguments.',
  },
  {
    id: 'worldviews',
    title: 'Worldview Map',
    description: 'Compare how each speaker positions themselves on fundamental questions of reality and ethics.',
  },
  {
    id: 'flow',
    title: 'Dialectical Flow',
    description: 'Watch the conversation unfold in time, with inflection points where it could have gone differently.',
  },
  {
    id: 'arena',
    title: 'Steel Man Arena',
    description: 'Experience an AI-enhanced version where both positions are steel-manned to their strongest forms.',
  },
]

function StatItem({ value, label, index }: { value: string; label: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
      className="text-center"
    >
      <div className="text-2xl font-semibold text-ink mb-space-1">{value}</div>
      <div className="text-sm text-ink-secondary">{label}</div>
    </motion.div>
  )
}

function LensPreviewCard({
  id,
  title,
  description,
  index,
  onSelect,
}: {
  id: Lens
  title: string
  description: string
  index: number
  onSelect: (id: Lens) => void
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(id)}
      className="card text-left w-full"
    >
      <h3 className="font-display text-lg text-ink mb-space-2">{title}</h3>
      <p className="text-sm text-ink-secondary leading-relaxed">{description}</p>
    </motion.button>
  )
}

function LandingPage({ onSelectLens }: { onSelectLens: (lens: Lens) => void }) {
  return (
    <div className="gradient-field-neutral min-h-screen">
      {/* Hero Section - 90vh */}
      <section className="h-[90vh] flex flex-col items-center justify-center px-space-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display-italic text-4xl md:text-5xl text-ink text-center mb-space-6"
        >
          Dialectical Topology
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg text-ink-secondary text-center max-w-prose mb-space-4"
        >
          Exploring the hidden structure of the{' '}
          <span className="text-marcus">Marcus</span>-<span className="text-demartini">Demartini</span>{' '}
          debate on evil, nonduality, and moral knowledge
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-sm text-ink-tertiary text-center"
        >
          Aubrey Marcus Podcast #521
        </motion.p>
      </section>

      {/* Stats Row */}
      <section className="py-space-12 px-space-6">
        <div className="max-w-content mx-auto grid grid-cols-2 md:grid-cols-4 gap-space-8">
          {STATS.map((stat, index) => (
            <StatItem key={stat.label} value={stat.value} label={stat.label} index={index} />
          ))}
        </div>
      </section>

      {/* Orientation Text */}
      <section className="py-space-12 px-space-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="max-w-prose mx-auto text-center"
        >
          <p className="text-ink-secondary leading-relaxed mb-space-4">
            This tool maps the philosophical terrain of a conversation between{' '}
            <span className="text-marcus">Aubrey Marcus</span> and{' '}
            <span className="text-demartini">Dr. John Demartini</span> about the nature of evil and moral reality.
          </p>
          <p className="text-ink-secondary leading-relaxed">
            Rather than picking sides, we use multiple analytical lenses to reveal the underlying
            structure of disagreement and the surprising points of convergence.
          </p>
        </motion.div>
      </section>

      {/* Lens Preview Cards - Vertical Stack */}
      <section className="py-space-16 px-space-6">
        <div className="max-w-prose mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="font-display text-2xl text-ink text-center mb-space-8"
          >
            Five Analytical Lenses
          </motion.h2>

          <div className="flex flex-col gap-space-4">
            {LENS_PREVIEWS.map((lens, index) => (
              <LensPreviewCard
                key={lens.id}
                id={lens.id}
                title={lens.title}
                description={lens.description}
                index={index}
                onSelect={onSelectLens}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-space-12 px-space-6 border-t border-border">
        <div className="max-w-prose mx-auto text-center">
          <p className="text-sm text-ink-tertiary mb-space-4">
            Methodology: Claims are extracted using semantic analysis, clustered by embedding similarity,
            and mapped across multiple dimensional axes representing philosophical positions.
          </p>
          <p className="text-sm text-ink-tertiary">
            Built with AI-assisted analysis as part of the{' '}
            <span className="text-ink-secondary">OpenCivics</span> sense-making toolkit.
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
    <main className="min-h-screen">
      <Navigation
        currentLens={activeLens}
        onSelectLens={handleSelectLens}
        onGoHome={handleGoHome}
      />
      <LensComponent />
    </main>
  )
}
