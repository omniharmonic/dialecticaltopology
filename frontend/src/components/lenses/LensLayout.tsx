'use client'

import { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LensLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  sidebar?: ReactNode
  /** Whether the sidebar has active detail content (triggers bottom-sheet on mobile) */
  sidebarOpen?: boolean
  /** Called when the mobile bottom-sheet backdrop is tapped */
  onSidebarClose?: () => void
  loading?: boolean
  error?: Error | null
}

export function LensLayout({
  title,
  subtitle,
  children,
  sidebar,
  sidebarOpen,
  onSidebarClose,
  loading,
  error,
}: LensLayoutProps) {
  // Lock body scroll when mobile sidebar sheet is open
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    if (sidebarOpen && mq.matches) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [sidebarOpen])
  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-field">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-ink-ghost border-t-ink rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-secondary">Loading {title}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-field">
        <div className="text-center text-marcus">
          <p className="text-xl mb-2">Failed to load data</p>
          <p className="text-sm text-ink-secondary">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-field">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pb-4"
      >
        <div className="max-w-content mx-auto">
          <h1 className="text-2xl font-display font-bold text-ink">{title}</h1>
          {subtitle && <p className="text-ink-secondary mt-1">{subtitle}</p>}
        </div>
      </motion.header>

      {/* Main content */}
      <div className="px-4 pb-8">
        <div className="max-w-content mx-auto">
          {sidebar ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-3"
              >
                {children}
              </motion.div>
              {/* Desktop sidebar — hidden on mobile, shown in grid on lg+ */}
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
              >
                {sidebar}
              </motion.aside>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet — slides up when sidebar has active detail */}
      <AnimatePresence>
        {sidebarOpen && onSidebarClose && sidebar && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/10 backdrop-blur-sm z-[9998] lg:hidden"
              onClick={onSidebarClose}
              aria-hidden="true"
            />
            <motion.div
              key="sidebar-sheet"
              initial={{ y: '100%', opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                transition: { type: 'spring', damping: 30, stiffness: 300 },
              }}
              exit={{
                y: '100%',
                opacity: 0,
                transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
              }}
              className="fixed left-0 right-0 bottom-0 z-[9999] max-h-[75vh] bg-field rounded-t-2xl shadow-xl flex flex-col lg:hidden"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1 rounded-full bg-ink-ghost" />
              </div>
              <div className="flex-1 overflow-y-auto px-1 pb-6">
                {sidebar}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Reusable detail panel for showing selected items
export function DetailPanel({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose?: () => void
}) {
  return (
    <div className="card sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-ink">{title}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="btn-ghost text-ink-tertiary hover:text-ink"
          >
            ✕
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

// Speaker badge component
export function SpeakerBadge({ speaker }: { speaker: string }) {
  const colors: Record<string, string> = {
    marcus: 'bg-marcus-faint text-marcus border-marcus/30',
    demartini: 'bg-demartini-faint text-demartini border-demartini/30',
    synthesis: 'bg-convergence-soft text-convergence border-convergence/30',
    mixed: 'bg-field-subtle text-ink-tertiary border-border',
  }

  const names: Record<string, string> = {
    marcus: 'Marcus',
    demartini: 'Demartini',
    synthesis: 'Synthesis',
    mixed: 'Both',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        colors[speaker] || colors.mixed
      }`}
    >
      {names[speaker] || speaker}
    </span>
  )
}

// Claim type badge
export function ClaimTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    ontological: 'bg-convergence-soft/50 text-convergence',
    epistemological: 'bg-demartini-faint text-demartini',
    ethical: 'bg-marcus-faint text-marcus',
    methodological: 'bg-insight/20 text-insight',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        colors[type] || 'bg-field-subtle text-ink-tertiary'
      }`}
    >
      {type}
    </span>
  )
}
