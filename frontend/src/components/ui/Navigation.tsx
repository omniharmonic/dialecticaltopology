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
