'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface LensLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  sidebar?: ReactNode
  loading?: boolean
  error?: Error | null
}

export function LensLayout({
  title,
  subtitle,
  children,
  sidebar,
  loading,
  error,
}: LensLayoutProps) {
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
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-1"
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
