'use client'

import { useAppStore, Lens } from '@/store/appStore'
import { motion } from 'framer-motion'

const lenses: { id: Lens; label: string; icon: string }[] = [
  { id: 'landscape', label: 'Semantic Landscape', icon: '◈' },
  { id: 'claims', label: 'Claim Atlas', icon: '◉' },
  { id: 'flow', label: 'Dialectical Flow', icon: '⟳' },
  { id: 'worldviews', label: 'Worldview Map', icon: '⬡' },
  { id: 'arena', label: 'Steel Man Arena', icon: '⚔' },
]

export function Navigation() {
  const { currentLens, setLens } = useAppStore()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel rounded-full p-1.5 flex items-center justify-center gap-1">
          {lenses.map((lens) => (
            <button
              key={lens.id}
              onClick={() => setLens(lens.id)}
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
