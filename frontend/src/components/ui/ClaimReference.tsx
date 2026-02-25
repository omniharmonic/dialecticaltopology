'use client'

import { useAppStore } from '@/store/appStore'

interface ClaimReferenceProps {
  claimId: string
  className?: string
}

/**
 * A clickable reference to a claim that navigates to the Claims lens
 * and selects the specified claim when clicked.
 *
 * Styled with monospace font and dotted underline to indicate interactivity.
 */
export function ClaimReference({ claimId, className = '' }: ClaimReferenceProps) {
  const setSelectedClaim = useAppStore((state) => state.setSelectedClaim)
  const setLens = useAppStore((state) => state.setLens)

  const handleClick = () => {
    setSelectedClaim(claimId)
    setLens('claims')
  }

  return (
    <button
      onClick={handleClick}
      className={`
        font-mono text-sm text-ink-tertiary
        hover:text-ink
        border-b border-dotted border-current
        transition-colors duration-instant
        ${className}
      `.trim()}
    >
      {claimId}
    </button>
  )
}

export default ClaimReference
