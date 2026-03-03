'use client'

import { motion } from 'framer-motion'

type Lens = 'landscape' | 'claims' | 'flow' | 'worldviews' | 'tree' | 'arena'

const lenses: { id: Lens; label: string; shortLabel: string }[] = [
  { id: 'landscape', label: 'Landscape', shortLabel: '3D' },
  { id: 'claims', label: 'Claims', shortLabel: 'Claims' },
  { id: 'flow', label: 'Flow', shortLabel: 'Flow' },
  { id: 'worldviews', label: 'Worldviews', shortLabel: 'Views' },
  { id: 'tree', label: 'Tree', shortLabel: 'Tree' },
  { id: 'arena', label: 'Arena', shortLabel: 'Arena' },
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
      <div className="max-w-content mx-auto h-full px-space-6 flex items-center justify-between gap-2">
        {/* Logo/Title */}
        <button
          onClick={onGoHome}
          className="font-display text-lg text-ink hover:text-ink-secondary transition-colors duration-instant shrink-0"
        >
          <span className="hidden sm:inline">Dialectical Topology</span>
          <span className="sm:hidden">DT</span>
        </button>

        {/* Lens Tabs - horizontally scrollable on mobile */}
        {currentLens && (
          <div className="flex items-center gap-0 sm:gap-space-1 overflow-x-auto scrollbar-none min-w-0 -mx-1 px-1">
            {lenses.map((lens) => (
              <button
                key={lens.id}
                onClick={() => onSelectLens(lens.id)}
                className={`
                  relative px-2 sm:px-space-4 py-space-2 text-sm font-medium whitespace-nowrap
                  min-h-[44px] min-w-[44px]
                  transition-colors duration-quick
                  ${currentLens === lens.id
                    ? 'text-ink'
                    : 'text-ink-secondary hover:text-ink'
                  }
                `}
              >
                <span className="hidden sm:inline">{lens.label}</span>
                <span className="sm:hidden">{lens.shortLabel}</span>
                {currentLens === lens.id && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 sm:left-space-4 sm:right-space-4 h-[2px] bg-ink"
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
