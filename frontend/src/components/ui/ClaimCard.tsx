'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import { TimecodeLink } from './TimecodeLink'
import { SpeakerBadge, ClaimTypeBadge } from '@/components/lenses/LensLayout'
import type { Claim, WikiIndex } from '@/lib/types'

// Props for the ClaimCard component
export interface ClaimCardProps {
  claim: Claim
  onClose: () => void
  onWarrantClick?: (warrantText: string) => void
  onEvidenceClick?: (evidenceText: string) => void
  onConceptClick?: (conceptId: string) => void
  onClaimClick?: (claimId: string) => void
  wikiData?: WikiIndex | null
  isOpen?: boolean
}

// Get icon for claim type
function getClaimTypeIcon(type: Claim['type']): string {
  switch (type) {
    case 'ontological':
      return '\u25C6' // diamond
    case 'epistemological':
      return '\u25CB' // circle
    case 'ethical':
      return '\u25A0' // filled square
    case 'methodological':
      return '\u25B2' // triangle
    default:
      return '\u25CF' // filled circle
  }
}

// Get speaker accent color
function getSpeakerAccentColor(speaker: Claim['speaker']): string {
  return speaker === 'marcus' ? '#C45A3C' : '#2E6B8A'
}

// Get engagement level indicator
function getEngagementIndicator(level: string): { label: string; color: string } {
  switch (level.toLowerCase()) {
    case 'high':
      return { label: 'High Engagement', color: 'bg-convergence-soft text-convergence' }
    case 'medium':
      return { label: 'Medium Engagement', color: 'bg-insight/20 text-insight' }
    case 'low':
      return { label: 'Low Engagement', color: 'bg-field-deep text-ink-tertiary' }
    default:
      return { label: level, color: 'bg-field-subtle text-ink-tertiary' }
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

export function ClaimCard({
  claim,
  onClose,
  onWarrantClick,
  onEvidenceClick,
  onConceptClick,
  wikiData,
  isOpen = true,
}: ClaimCardProps) {
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

  const speakerAccent = getSpeakerAccentColor(claim.speaker)
  const engagementInfo = getEngagementIndicator(claim.engagement_level)

  // Render the card content (shared between desktop and mobile)
  const renderContent = () => (
    <>
      {/* Claim ID and Badges */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <SpeakerBadge speaker={claim.speaker} />
        <ClaimTypeBadge type={claim.type} />
        <span className={cn(
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
          engagementInfo.color
        )}>
          {engagementInfo.label}
        </span>
      </div>

      {/* Timestamp */}
      <div className="mb-4">
        <span className="text-xs text-ink-tertiary mr-2">Timestamp:</span>
        <TimecodeLink seconds={claim.timestamp} />
      </div>

      {/* Claim text blockquote */}
      <blockquote
        className="text-sm italic pl-3 text-ink-secondary mb-6"
        style={{ borderLeft: `2px solid ${speakerAccent}` }}
      >
        "{claim.text}"
      </blockquote>

      {/* Supporting Warrants */}
      {claim.warrants.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs uppercase tracking-wider text-ink-tertiary mb-2">
            Supporting Warrants ({claim.warrants.length})
          </h3>
          <div className="space-y-2">
            {claim.warrants.map((warrant, index) => (
              <button
                key={index}
                onClick={() => onWarrantClick?.(warrant)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg',
                  'bg-field-subtle hover:bg-field-deep',
                  'text-sm text-ink-secondary',
                  'transition-colors duration-quick',
                  'border border-transparent hover:border-convergence/30'
                )}
              >
                <span className="text-convergence mr-2">{'\u25C6'}</span>
                {warrant}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Cited */}
      {claim.evidence.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs uppercase tracking-wider text-ink-tertiary mb-2">
            Evidence Cited ({claim.evidence.length})
          </h3>
          <div className="space-y-2">
            {claim.evidence.map((evidence, index) => (
              <button
                key={index}
                onClick={() => onEvidenceClick?.(evidence)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg',
                  'bg-field-subtle hover:bg-field-deep',
                  'text-sm text-ink-secondary',
                  'transition-colors duration-quick',
                  'border border-transparent hover:border-insight/30'
                )}
              >
                <span className="text-insight mr-2">{'\u2713'}</span>
                {evidence}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Related Concepts */}
      {claim.related_concepts.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-ink-tertiary mb-2">
            Related Concepts
          </h3>
          <div className="flex flex-wrap gap-2">
            {claim.related_concepts.map((conceptId, index) => {
              // Search all entity categories in wiki index
              const concept = wikiData?.concepts.find(c => c.id === conceptId)
                || wikiData?.thinkers?.find(c => c.id === conceptId)
                || wikiData?.frameworks?.find(c => c.id === conceptId)
                || wikiData?.traditions?.find(c => c.id === conceptId)
              const label = concept?.label || conceptId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

              return (
                <button
                  key={index}
                  onClick={() => onConceptClick?.(conceptId)}
                  className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full',
                    'bg-field-deep text-xs text-ink-secondary',
                    'border border-border',
                    onConceptClick && concept ? 'hover:bg-field-subtle hover:border-demartini cursor-pointer transition-colors' : ''
                  )}
                  disabled={!concept || !onConceptClick}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )

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
            className="fixed inset-0 bg-ink/10 backdrop-blur-sm z-[9998]"
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
              'fixed right-0 top-16 bottom-0 z-[9999]',
              'w-[380px] max-w-[90vw]',
              'bg-field shadow-xl border-l border-border',
              'flex flex-col',
              'hidden md:flex' // Hide on mobile
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="claim-card-title"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 border-b border-border"
              style={{ borderBottomColor: `${speakerAccent}40` }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-lg"
                  style={{ color: speakerAccent }}
                >
                  {getClaimTypeIcon(claim.type)}
                </span>
                <h2
                  id="claim-card-title"
                  className="font-display font-semibold text-ink"
                >
                  {claim.id}
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
                Claim
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderContent()}
            </div>
          </motion.div>

          {/* Mobile: Bottom sheet (70vh max) */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'fixed left-0 right-0 bottom-0 z-[9999]',
              'max-h-[70vh]',
              'bg-field rounded-t-2xl shadow-xl',
              'flex flex-col',
              'md:hidden' // Only show on mobile
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="claim-card-title-mobile"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-12 h-1 rounded-full"
                style={{ backgroundColor: speakerAccent }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span
                  className="text-lg"
                  style={{ color: speakerAccent }}
                >
                  {getClaimTypeIcon(claim.type)}
                </span>
                <h2
                  id="claim-card-title-mobile"
                  className="font-display font-semibold text-ink"
                >
                  {claim.id}
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
                Claim
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderContent()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Export a wrapper component for controlled visibility
export function ClaimCardPortal(props: ClaimCardProps) {
  return <ClaimCard {...props} />
}

export default ClaimCard
