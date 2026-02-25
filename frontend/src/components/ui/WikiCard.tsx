'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { WarrantEntry, EvidenceEntry } from '@/lib/types'

// Generic entry type for concepts, thinkers, frameworks
interface GenericEntry {
  id: string
  label: string
  description: string
}

// Union type for all possible entries
type WikiEntry = WarrantEntry | EvidenceEntry | GenericEntry

// Props for the WikiCard component
export interface WikiCardProps {
  type: 'warrant' | 'evidence' | 'concept' | 'thinker' | 'framework'
  entry: WikiEntry
  onClose: () => void
  onClaimClick?: (claimId: string) => void
  isOpen?: boolean
}

// Type guards for entry types
function isWarrantEntry(entry: WikiEntry): entry is WarrantEntry {
  return 'type' in entry && 'strength' in entry && 'used_by' in entry
}

function isEvidenceEntry(entry: WikiEntry): entry is EvidenceEntry {
  return 'source_type' in entry && 'cited_by' in entry && 'verifiable' in entry
}

// Get icon for entry type
function getTypeIcon(type: WikiCardProps['type']): string {
  switch (type) {
    case 'warrant':
      return '\u25C6' // diamond
    case 'evidence':
      return '\u2713' // checkmark
    case 'concept':
      return '\u25CB' // circle
    case 'thinker':
      return '\u25D0' // half circle
    case 'framework':
      return '\u25A1' // square
    default:
      return '\u25CF' // filled circle
  }
}

// Get color class for entry type
function getTypeColor(type: WikiCardProps['type']): string {
  switch (type) {
    case 'warrant':
      return 'text-convergence'
    case 'evidence':
      return 'text-insight'
    case 'concept':
      return 'text-demartini'
    case 'thinker':
      return 'text-marcus'
    case 'framework':
      return 'text-ink-secondary'
    default:
      return 'text-ink-tertiary'
  }
}

// Get strength badge color
function getStrengthColor(strength: WarrantEntry['strength']): string {
  switch (strength) {
    case 'strong':
      return 'bg-convergence-soft text-convergence'
    case 'moderate':
      return 'bg-insight/20 text-insight'
    case 'weak':
      return 'bg-field-deep text-ink-tertiary'
    default:
      return 'bg-field-subtle text-ink-tertiary'
  }
}

// Get source type badge color
function getSourceTypeColor(sourceType: EvidenceEntry['source_type']): string {
  switch (sourceType) {
    case 'study':
      return 'bg-demartini-faint text-demartini'
    case 'authority':
      return 'bg-marcus-faint text-marcus'
    case 'example':
      return 'bg-convergence-soft text-convergence'
    case 'anecdote':
      return 'bg-insight/20 text-insight'
    case 'analogy':
      return 'bg-field-deep text-ink-secondary'
    default:
      return 'bg-field-subtle text-ink-tertiary'
  }
}

// Get warrant type badge color
function getWarrantTypeColor(warrantType: WarrantEntry['type']): string {
  switch (warrantType) {
    case 'logical':
      return 'bg-demartini-faint text-demartini'
    case 'empirical':
      return 'bg-convergence-soft text-convergence'
    case 'experiential':
      return 'bg-marcus-faint text-marcus'
    case 'authoritative':
      return 'bg-insight/20 text-insight'
    default:
      return 'bg-field-subtle text-ink-tertiary'
  }
}

// Slide-in animation variants for desktop (right side)
const slideVariants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Bottom sheet animation variants for mobile
const sheetVariants = {
  hidden: {
    y: '100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Backdrop animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export function WikiCard({
  type,
  entry,
  onClose,
  onClaimClick,
  isOpen = true,
}: WikiCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when card is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Get referenced claims based on entry type
  const getReferencedClaims = (): string[] => {
    if (isWarrantEntry(entry)) {
      return entry.used_by
    }
    if (isEvidenceEntry(entry)) {
      return entry.cited_by
    }
    return []
  }

  const referencedClaims = getReferencedClaims()

  // Render content based on entry type
  const renderContent = () => {
    if (isWarrantEntry(entry)) {
      return (
        <div className="space-y-4">
          {/* Warrant text */}
          <blockquote className="text-sm italic border-l-2 border-convergence pl-3 text-ink-secondary">
            "{entry.text}"
          </blockquote>

          {/* Description */}
          {entry.description && (
            <p className="text-sm text-ink-secondary leading-relaxed">
              {entry.description}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
                getWarrantTypeColor(entry.type)
              )}
            >
              {entry.type}
            </span>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
                getStrengthColor(entry.strength)
              )}
            >
              {entry.strength} strength
            </span>
          </div>
        </div>
      )
    }

    if (isEvidenceEntry(entry)) {
      return (
        <div className="space-y-4">
          {/* Evidence text */}
          <blockquote className="text-sm italic border-l-2 border-insight pl-3 text-ink-secondary">
            "{entry.text}"
          </blockquote>

          {/* Description */}
          {entry.description && (
            <p className="text-sm text-ink-secondary leading-relaxed">
              {entry.description}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
                getSourceTypeColor(entry.source_type)
              )}
            >
              {entry.source_type.replace('_', ' ')}
            </span>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                entry.verifiable
                  ? 'bg-convergence-soft text-convergence'
                  : 'bg-field-deep text-ink-tertiary'
              )}
            >
              {entry.verifiable ? 'Verifiable' : 'Unverifiable'}
            </span>
          </div>
        </div>
      )
    }

    // Generic entry (concept, thinker, framework)
    const genericEntry = entry as GenericEntry
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink-secondary leading-relaxed">
          {genericEntry.description}
        </p>
      </div>
    )
  }

  // Get title based on entry type
  const getTitle = (): string => {
    if (isWarrantEntry(entry)) {
      return `${entry.id}: ${entry.title || entry.id}`
    }
    if (isEvidenceEntry(entry)) {
      return `${entry.id}: ${entry.title || entry.id}`
    }
    return (entry as GenericEntry).label
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-ink/10 backdrop-blur-sm z-[100]"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Desktop: Slide-in from right (380px wide) */}
          <motion.div
            ref={cardRef}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'fixed right-0 top-0 bottom-0 z-[110]',
              'w-[380px] max-w-[90vw]',
              'bg-field shadow-xl',
              'flex flex-col',
              'hidden md:flex' // Hide on mobile
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wiki-card-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className={cn('text-lg', getTypeColor(type))}>
                  {getTypeIcon(type)}
                </span>
                <h2
                  id="wiki-card-title"
                  className="font-display font-semibold text-ink"
                >
                  {getTitle()}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="btn-ghost text-ink-tertiary hover:text-ink p-1"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Type label */}
            <div className="px-4 pt-3">
              <span className="text-xs uppercase tracking-wider text-ink-tertiary">
                {type}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>

            {/* Footer: Referenced claims */}
            {referencedClaims.length > 0 && (
              <div className="border-t border-border p-4">
                <h3 className="text-xs uppercase tracking-wider text-ink-tertiary mb-3">
                  Referenced in {referencedClaims.length} claim
                  {referencedClaims.length !== 1 ? 's' : ''}
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {referencedClaims.map((claimId) => (
                    <button
                      key={claimId}
                      onClick={() => onClaimClick?.(claimId)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg',
                        'bg-field-subtle hover:bg-field-deep',
                        'text-sm font-mono text-ink-secondary',
                        'transition-colors duration-quick'
                      )}
                    >
                      {claimId}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Mobile: Bottom sheet (60vh max) */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'fixed left-0 right-0 bottom-0 z-[110]',
              'max-h-[60vh]',
              'bg-field rounded-t-2xl shadow-xl',
              'flex flex-col',
              'md:hidden' // Only show on mobile
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wiki-card-title-mobile"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 rounded-full bg-border-active" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className={cn('text-lg', getTypeColor(type))}>
                  {getTypeIcon(type)}
                </span>
                <h2
                  id="wiki-card-title-mobile"
                  className="font-display font-semibold text-ink"
                >
                  {getTitle()}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="btn-ghost text-ink-tertiary hover:text-ink p-1"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Type label */}
            <div className="px-4 pt-3">
              <span className="text-xs uppercase tracking-wider text-ink-tertiary">
                {type}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>

            {/* Footer: Referenced claims */}
            {referencedClaims.length > 0 && (
              <div className="border-t border-border p-4">
                <h3 className="text-xs uppercase tracking-wider text-ink-tertiary mb-3">
                  Referenced in {referencedClaims.length} claim
                  {referencedClaims.length !== 1 ? 's' : ''}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {referencedClaims.slice(0, 5).map((claimId) => (
                    <button
                      key={claimId}
                      onClick={() => onClaimClick?.(claimId)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg',
                        'bg-field-subtle hover:bg-field-deep',
                        'text-xs font-mono text-ink-secondary',
                        'transition-colors duration-quick'
                      )}
                    >
                      {claimId}
                    </button>
                  ))}
                  {referencedClaims.length > 5 && (
                    <span className="px-2 py-1.5 text-xs text-ink-tertiary">
                      +{referencedClaims.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Export a wrapper component for controlled visibility
export function WikiCardPortal(props: WikiCardProps) {
  return <WikiCard {...props} />
}

export default WikiCard
