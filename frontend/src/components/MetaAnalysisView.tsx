'use client'

import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useClaims, useWikiIndex } from '@/lib/useData'
import { ClaimCard } from '@/components/ui/ClaimCard'
import { WikiCard } from '@/components/ui/WikiCard'
import type { Claim, WikiIndex, WarrantEntry, EvidenceEntry } from '@/lib/types'
import type { Lens } from '@/store/appStore'

// Detect basePath for deployment
function getPublicPath(filename: string): string {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dialecticaltopology')) {
    return `/dialecticaltopology/${filename}`
  }
  return `/${filename}`
}

// Lens name to ID mapping
const LENS_MAP: Record<string, Lens> = {
  'semantic landscape': 'landscape',
  'claim atlas': 'claims',
  'dialectical flow': 'flow',
  'worldview map': 'worldviews',
  'epistemological tree': 'tree',
  'steel man arena': 'arena',
}

// Section IDs for table of contents navigation
interface TocEntry {
  id: string
  label: string
  level: number
}

interface MetaAnalysisViewProps {
  onClose: () => void
  onSelectLens: (lens: Lens) => void
}

export function MetaAnalysisView({ onClose, onSelectLens }: MetaAnalysisViewProps) {
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [selectedWikiEntry, setSelectedWikiEntry] = useState<{
    type: 'warrant' | 'evidence' | 'concept' | 'thinker' | 'framework'
    entry: WarrantEntry | EvidenceEntry | { id: string; label: string; description: string }
  } | null>(null)
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string>('')

  const { data: claimsData } = useClaims()
  const { data: wikiData } = useWikiIndex()

  // Fetch the markdown
  useEffect(() => {
    fetch(getPublicPath('META_ANALYSIS.md'))
      .then((res) => res.text())
      .then((text) => {
        setMarkdown(text)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Handle claim click
  const handleClaimClick = useCallback(
    (claimId: string) => {
      if (!claimsData) return
      const claim = claimsData.claims.find((c) => c.id === claimId)
      if (claim) {
        setSelectedClaim(claim)
      }
    },
    [claimsData]
  )

  // Handle warrant click
  const handleWarrantClick = useCallback(
    (warrantId: string) => {
      if (!wikiData) return
      const warrant = wikiData.warrants.find((w) => w.id === warrantId)
      if (warrant) {
        setSelectedWikiEntry({ type: 'warrant', entry: warrant })
      }
    },
    [wikiData]
  )

  // Handle evidence click
  const handleEvidenceClick = useCallback(
    (evidenceId: string) => {
      if (!wikiData) return
      const evidence = wikiData.evidence.find((e) => e.id === evidenceId)
      if (evidence) {
        setSelectedWikiEntry({ type: 'evidence', entry: evidence })
      }
    },
    [wikiData]
  )

  // Parse markdown into sections and generate TOC
  const { sections, toc } = useMemo(() => {
    if (!markdown) return { sections: [], toc: [] }

    const lines = markdown.split('\n')
    const secs: { id: string; level: number; title: string; content: string[] }[] = []
    const tocEntries: TocEntry[] = []
    let currentSection: { id: string; level: number; title: string; content: string[] } | null = null

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,3})\s+(.+)$/)
      if (headerMatch) {
        const level = headerMatch[1].length
        const title = headerMatch[2].replace(/\*\*/g, '').replace(/\*/g, '')
        const id = title
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 50)

        if (currentSection) secs.push(currentSection)
        currentSection = { id, level, title, content: [] }

        if (level <= 2) {
          tocEntries.push({ id, label: title, level })
        }
      } else if (currentSection) {
        currentSection.content.push(line)
      } else {
        // Content before first header
        if (!currentSection) {
          currentSection = { id: 'intro', level: 0, title: '', content: [line] }
        }
      }
    }
    if (currentSection) secs.push(currentSection)

    return { sections: secs, toc: tocEntries }
  }, [markdown])

  // Render inline text with interactive references
  const renderInlineText = useCallback(
    (text: string): ReactNode[] => {
      const parts: ReactNode[] = []
      // Combined regex for all reference types and markdown formatting
      // Order: bold, italic, claim refs, warrant refs, evidence refs, inflection points, lens names
      const regex =
        /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(\b([DM]\d{2})\b)|(\b(W\d{2})\b)|(\b(E\d{2})\b)|(\b(IP\d{2})\b)/g

      let lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = regex.exec(text)) !== null) {
        // Push text before the match
        if (match.index > lastIndex) {
          parts.push(text.slice(lastIndex, match.index))
        }

        if (match[1]) {
          // Bold text
          parts.push(
            <strong key={`b-${match.index}`} className="font-semibold text-ink">
              {match[2]}
            </strong>
          )
        } else if (match[3]) {
          // Italic text
          parts.push(
            <em key={`i-${match.index}`} className="italic">
              {match[4]}
            </em>
          )
        } else if (match[5]) {
          // Claim reference (D01, M15, etc.)
          const claimId = match[6]
          parts.push(
            <button
              key={`c-${match.index}`}
              onClick={() => handleClaimClick(claimId)}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-field-deep border border-border hover:border-marcus/40 hover:bg-field-subtle transition-colors cursor-pointer"
              title={`View claim ${claimId}`}
            >
              {claimId}
            </button>
          )
        } else if (match[7]) {
          // Warrant reference (W01, etc.)
          const warrantId = match[8]
          parts.push(
            <button
              key={`w-${match.index}`}
              onClick={() => handleWarrantClick(warrantId)}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-convergence-soft/30 border border-convergence/20 hover:border-convergence/50 transition-colors cursor-pointer text-convergence"
              title={`View warrant ${warrantId}`}
            >
              {warrantId}
            </button>
          )
        } else if (match[9]) {
          // Evidence reference (E01, etc.)
          const evidenceId = match[10]
          parts.push(
            <button
              key={`e-${match.index}`}
              onClick={() => handleEvidenceClick(evidenceId)}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-insight/10 border border-insight/20 hover:border-insight/50 transition-colors cursor-pointer text-insight"
              title={`View evidence ${evidenceId}`}
            >
              {evidenceId}
            </button>
          )
        } else if (match[11]) {
          // Inflection point reference (IP03, etc.)
          parts.push(
            <button
              key={`ip-${match.index}`}
              onClick={() => onSelectLens('flow')}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-insight/10 border border-insight/20 hover:border-insight/50 transition-colors cursor-pointer text-insight"
              title={`View inflection point ${match[12]} in Dialectical Flow`}
            >
              {match[12]}
            </button>
          )
        }

        lastIndex = match.index + match[0].length
      }

      // Remaining text
      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex))
      }

      return parts.length > 0 ? parts : [text]
    },
    [handleClaimClick, handleWarrantClick, handleEvidenceClick, onSelectLens]
  )

  // Check for lens name links in text
  const renderTextWithLensLinks = useCallback(
    (text: string): ReactNode[] => {
      const parts: ReactNode[] = []
      // Match lens names (case insensitive)
      const lensNames = Object.keys(LENS_MAP)
      const lensRegex = new RegExp(`\\b(${lensNames.map(n => n.replace(/\s/g, '\\s')).join('|')})\\b`, 'gi')

      let lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = lensRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          // Render preceding text with inline references
          parts.push(...renderInlineText(text.slice(lastIndex, match.index)))
        }
        const lensName = match[1]
        const lensId = LENS_MAP[lensName.toLowerCase()]
        if (lensId) {
          parts.push(
            <button
              key={`lens-${match.index}`}
              onClick={() => onSelectLens(lensId)}
              className="text-ink font-medium underline decoration-ink-tertiary decoration-1 underline-offset-2 hover:decoration-ink transition-colors cursor-pointer"
            >
              {lensName}
            </button>
          )
        }
        lastIndex = match.index + match[0].length
      }

      if (lastIndex < text.length) {
        parts.push(...renderInlineText(text.slice(lastIndex)))
      }

      return parts.length > 0 ? parts : renderInlineText(text)
    },
    [renderInlineText, onSelectLens]
  )

  // Render a content line
  const renderLine = useCallback(
    (line: string, index: number): ReactNode | null => {
      if (!line.trim()) return null

      // Blockquote
      if (line.startsWith('>')) {
        const content = line.replace(/^>\s*/, '')
        return (
          <blockquote
            key={index}
            className="border-l-2 border-convergence pl-4 py-1 text-sm italic text-ink-secondary my-3"
          >
            {renderTextWithLensLinks(content)}
          </blockquote>
        )
      }

      // Horizontal rule
      if (line.match(/^-{3,}$/)) {
        return <hr key={index} className="border-border my-8" />
      }

      // Subheader within content (### )
      if (line.startsWith('### ')) {
        const title = line.replace(/^###\s+/, '').replace(/\*\*/g, '')
        return (
          <h4 key={index} className="font-display text-base font-semibold text-ink mt-6 mb-3">
            {renderTextWithLensLinks(title)}
          </h4>
        )
      }

      // List items
      if (line.match(/^[-*]\s/)) {
        const content = line.replace(/^[-*]\s+/, '')
        return (
          <li key={index} className="text-sm text-ink-secondary leading-relaxed ml-4 list-disc">
            {renderTextWithLensLinks(content)}
          </li>
        )
      }

      // Numbered list items
      if (line.match(/^\d+\.\s/)) {
        const content = line.replace(/^\d+\.\s+/, '')
        return (
          <li key={index} className="text-sm text-ink-secondary leading-relaxed ml-4 list-decimal">
            {renderTextWithLensLinks(content)}
          </li>
        )
      }

      // Check/cross markers
      if (line.startsWith('✓') || line.startsWith('✗')) {
        const isCheck = line.startsWith('✓')
        const content = line.slice(1).trim()
        return (
          <div key={index} className="flex items-start gap-2 text-sm my-1">
            <span className={isCheck ? 'text-convergence' : 'text-marcus'}>{isCheck ? '✓' : '✗'}</span>
            <span className="text-ink-secondary">{renderTextWithLensLinks(content)}</span>
          </div>
        )
      }

      // Tree-like arrow lines
      if (line.includes('↓ implies ↓')) {
        return (
          <div key={index} className="text-center text-ink-tertiary text-xs my-1">
            ↓ implies ↓
          </div>
        )
      }

      // Regular paragraph
      return (
        <p key={index} className="text-sm text-ink-secondary leading-relaxed my-2">
          {renderTextWithLensLinks(line)}
        </p>
      )
    },
    [renderTextWithLensLinks]
  )

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.getElementById('meta-analysis-content')
      if (!scrollContainer) return

      for (const entry of toc) {
        const el = document.getElementById(`section-${entry.id}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120) {
            setActiveSection(entry.id)
          }
        }
      }
    }

    const container = document.getElementById('meta-analysis-content')
    container?.addEventListener('scroll', handleScroll, { passive: true })
    return () => container?.removeEventListener('scroll', handleScroll)
  }, [toc])

  if (loading) {
    return (
      <div className="min-h-screen pt-[56px] flex items-center justify-center gradient-field-neutral">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-ink-ghost border-t-ink rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-secondary">Loading Meta-Analysis...</p>
        </div>
      </div>
    )
  }

  if (!markdown) {
    return (
      <div className="min-h-screen pt-[56px] flex items-center justify-center gradient-field-neutral">
        <p className="text-ink-secondary">Failed to load meta-analysis.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-[56px] gradient-field-neutral">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
        {/* Table of Contents - sidebar on desktop, hidden on mobile */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <h3 className="text-xs uppercase tracking-wider text-ink-tertiary mb-3 font-medium">
              Contents
            </h3>
            <ul className="space-y-1">
              {toc.map((entry) => (
                <li key={entry.id}>
                  <button
                    onClick={() => {
                      document
                        .getElementById(`section-${entry.id}`)
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className={`
                      block w-full text-left text-xs leading-snug py-1 transition-colors
                      ${entry.level === 1 ? 'font-medium' : 'pl-3'}
                      ${activeSection === entry.id
                        ? 'text-ink'
                        : 'text-ink-tertiary hover:text-ink-secondary'
                      }
                    `}
                  >
                    {entry.label.length > 35 ? entry.label.slice(0, 35) + '...' : entry.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main id="meta-analysis-content" className="min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {sections.map((section) => (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className="mb-8"
              >
                {section.level === 1 && section.title && (
                  <h1 className="font-display text-2xl md:text-3xl text-ink mb-4 leading-tight">
                    {renderTextWithLensLinks(section.title)}
                  </h1>
                )}
                {section.level === 2 && (
                  <h2 className="font-display text-xl md:text-2xl text-ink mb-4 mt-10 leading-tight">
                    {renderTextWithLensLinks(section.title)}
                  </h2>
                )}
                {section.level === 3 && (
                  <h3 className="font-display text-lg font-semibold text-ink mb-3 mt-6">
                    {renderTextWithLensLinks(section.title)}
                  </h3>
                )}

                <div>
                  {section.content.map((line, i) => renderLine(line, i))}
                </div>
              </section>
            ))}

            {/* Back to top */}
            <div className="text-center py-8 border-t border-border mt-12">
              <button
                onClick={onClose}
                className="text-sm text-ink-tertiary hover:text-ink transition-colors"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        </main>
      </div>

      {/* ClaimCard popup */}
      {selectedClaim && (
        <ClaimCard
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          wikiData={wikiData}
          onConceptClick={(conceptId) => {
            setSelectedClaim(null)
            setSelectedConcept(conceptId)
          }}
          onClaimClick={(claimId) => {
            setSelectedConcept(null)
            handleClaimClick(claimId)
          }}
          isOpen={true}
        />
      )}

      {/* WikiCard popup for warrants/evidence */}
      {selectedWikiEntry && (
        <WikiCard
          type={selectedWikiEntry.type}
          entry={selectedWikiEntry.entry}
          onClose={() => setSelectedWikiEntry(null)}
          onClaimClick={(claimId) => {
            setSelectedWikiEntry(null)
            handleClaimClick(claimId)
          }}
          isOpen={true}
        />
      )}

      {/* WikiCard for concepts */}
      {selectedConcept && wikiData && (() => {
        const concept = wikiData.concepts.find(c => c.id === selectedConcept)
        const thinker = !concept ? wikiData.thinkers?.find(c => c.id === selectedConcept) : null
        const framework = !concept && !thinker ? wikiData.frameworks?.find(c => c.id === selectedConcept) : null
        const entry = concept || thinker || framework
        const entryType = concept ? 'concept' as const : thinker ? 'thinker' as const : 'framework' as const
        if (!entry) return null
        return (
          <WikiCard
            type={entryType}
            entry={entry}
            onClose={() => setSelectedConcept(null)}
            onClaimClick={(claimId) => {
              setSelectedConcept(null)
              handleClaimClick(claimId)
            }}
            isOpen={true}
          />
        )
      })()}
    </div>
  )
}
