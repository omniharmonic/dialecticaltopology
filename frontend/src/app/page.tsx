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
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-marcus/30 border-t-marcus rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading {name}...</p>
      </div>
    </div>
  )
}

// Stats for landing page
const STATS = {
  duration: '1h 45m',
  chunks: 270,
  claims: 42,
  dimensions: 8,
}

function StatCard({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <div className="glass-panel rounded-xl p-6 text-center">
      <div className="text-3xl font-display font-bold gradient-text mb-2">{value}</div>
      <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
      {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
    </div>
  )
}

function LensPreview({
  id,
  title,
  description,
  icon,
  onSelect,
}: {
  id: string
  title: string
  description: string
  icon: string
  onSelect: (id: Lens) => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(id as Lens)}
      className="glass-panel rounded-xl p-6 text-left transition-all hover:border-marcus/30 group"
    >
      <div className="text-3xl mb-3 opacity-60 group-hover:opacity-100 transition-opacity">{icon}</div>
      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </motion.button>
  )
}

function LandingPage({ onSelectLens }: { onSelectLens: (lens: Lens) => void }) {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-display font-bold mb-6"
          >
            <span className="gradient-text">Dialectical Topology</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto"
          >
            Exploring the hidden structure of the{' '}
            <span className="text-marcus">Marcus</span>–<span className="text-demartini">Demartini</span>{' '}
            debate on evil, nonduality, and moral knowledge
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-500"
          >
            Aubrey Marcus Podcast #521 • "No Such Thing As Evil"
          </motion.p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Duration" value={STATS.duration} />
          <StatCard label="Segments" value={STATS.chunks} />
          <StatCard label="Claims" value={STATS.claims} />
          <StatCard label="Dimensions" value={STATS.dimensions} />
        </div>
      </section>

      {/* Lens Previews */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold mb-8 text-center">
            Five Analytical Lenses
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LensPreview
              id="landscape"
              icon="◈"
              title="Semantic Landscape"
              description="Navigate a 3D space where ideas cluster by meaning, revealing hidden patterns in the conversation."
              onSelect={onSelectLens}
            />
            <LensPreview
              id="claims"
              icon="◉"
              title="Claim Atlas"
              description="Explore every philosophical claim, see how speakers engage with each other's arguments."
              onSelect={onSelectLens}
            />
            <LensPreview
              id="flow"
              icon="⟳"
              title="Dialectical Flow"
              description="Watch the conversation unfold in time, with inflection points where it could have gone differently."
              onSelect={onSelectLens}
            />
            <LensPreview
              id="worldviews"
              icon="⬡"
              title="Worldview Map"
              description="Compare how each speaker positions themselves on fundamental questions of reality and ethics."
              onSelect={onSelectLens}
            />
            <LensPreview
              id="arena"
              icon="⚔"
              title="Steel Man Arena"
              description="Experience an AI-enhanced version where both positions are steel-manned to their strongest forms."
              onSelect={onSelectLens}
            />
          </div>
        </div>
      </section>

      {/* The Question */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="text-2xl font-display italic text-gray-300 mb-4">
            "Is there such a thing as evil, or is it all a matter of perspective?"
          </blockquote>
          <p className="text-gray-500">
            The central question driving this 1h 45m philosophical exploration
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-void-200">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <p>
            Built with AI-assisted analysis • Part of the{' '}
            <span className="text-marcus">OpenCivics</span> sense-making toolkit
          </p>
        </div>
      </footer>
    </>
  )
}

// Updated Navigation for lens switching
function LensNavigation({
  currentLens,
  onSelectLens,
  onGoHome,
}: {
  currentLens: Lens
  onSelectLens: (lens: Lens) => void
  onGoHome: () => void
}) {
  const lenses: { id: Lens; label: string; icon: string }[] = [
    { id: 'landscape', label: 'Semantic Landscape', icon: '◈' },
    { id: 'claims', label: 'Claim Atlas', icon: '◉' },
    { id: 'flow', label: 'Dialectical Flow', icon: '⟳' },
    { id: 'worldviews', label: 'Worldview Map', icon: '⬡' },
    { id: 'arena', label: 'Steel Man Arena', icon: '⚔' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel rounded-full p-1.5 flex items-center justify-center gap-1">
          {/* Home button */}
          <button
            onClick={onGoHome}
            className="px-3 py-2 rounded-full text-sm text-gray-400 hover:text-white transition-colors"
            title="Back to Home"
          >
            ⌂
          </button>

          {lenses.map((lens) => (
            <button
              key={lens.id}
              onClick={() => onSelectLens(lens.id)}
              className={`
                relative px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 flex items-center gap-2
                ${currentLens === lens.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
                }
              `}
            >
              {currentLens === lens.id && (
                <motion.div
                  layoutId="activeLens"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-marcus/20 to-demartini/20 border border-marcus/40"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{lens.icon}</span>
              <span className="relative z-10 hidden sm:inline">{lens.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
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
  const { currentLens, setLens } = useAppStore()

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
      <LensNavigation
        currentLens={activeLens}
        onSelectLens={handleSelectLens}
        onGoHome={handleGoHome}
      />
      <LensComponent />
    </main>
  )
}
