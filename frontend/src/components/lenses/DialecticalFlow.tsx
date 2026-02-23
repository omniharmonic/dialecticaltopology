'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFlow } from '@/lib/useData'
import { LensLayout, DetailPanel, SpeakerBadge } from './LensLayout'
import type { FlowPhase, InflectionPoint } from '@/lib/types'

// Design token colors for SVG (mirrors CSS custom properties)
const MARCUS_COLOR = '#C45A3C'      // --marcus
const BORDER_COLOR = '#E8E8E6'      // --border
const INSIGHT_COLOR = '#D4A853'     // --insight (for inflection points)

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Phase card on the timeline
function PhaseCard({
  phase,
  isSelected,
  onClick,
  maxTime,
}: {
  phase: FlowPhase
  isSelected: boolean
  onClick: () => void
  maxTime: number
}) {
  const widthPercent = ((phase.end_time - phase.start_time) / maxTime) * 100
  const leftPercent = (phase.start_time / maxTime) * 100

  // Simplified mood colors using semantic design tokens
  const getMoodColor = (mood: string) => {
    // High tension moods
    if (['contentious', 'heated', 'crisis', 'rupture', 'confrontational'].includes(mood)) {
      return 'border-marcus/60'
    }
    // Constructive moods
    if (['seeking_common_ground', 'constructive'].includes(mood)) {
      return 'border-convergence/60'
    }
    // Philosophical/reflective moods
    if (['philosophical', 'metaphysical', 'reflective', 'theological'].includes(mood)) {
      return 'border-demartini/60'
    }
    // Teaching/testimony moods
    if (['teaching', 'testimony'].includes(mood)) {
      return 'border-insight/60'
    }
    // Default
    return 'border-border-active'
  }

  return (
    <motion.button
      layout
      onClick={onClick}
      className={`
        absolute top-0 h-full rounded-lg border-2 transition-all
        ${getMoodColor(phase.mood)}
        ${isSelected ? 'bg-field-deep z-10' : 'bg-field-subtle hover:bg-field-deep'}
      `}
      style={{
        left: `${leftPercent}%`,
        width: `${Math.max(widthPercent, 2)}%`,
      }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="p-2 h-full flex flex-col justify-between overflow-hidden">
        <span className="text-xs font-medium text-ink truncate">{phase.label}</span>
        <div className="flex items-center gap-1">
          <SpeakerBadge speaker={phase.dominant_speaker} />
        </div>
      </div>
    </motion.button>
  )
}

// Inflection point marker - gold diamonds per spec
function InflectionMarker({
  point,
  isSelected,
  onClick,
  maxTime,
}: {
  point: InflectionPoint
  isSelected: boolean
  onClick: () => void
  maxTime: number
}) {
  const leftPercent = (point.timestamp / maxTime) * 100

  return (
    <motion.button
      onClick={onClick}
      className={`
        absolute -translate-x-1/2 z-20 group
        ${isSelected ? 'scale-125' : ''}
      `}
      style={{ left: `${leftPercent}%` }}
      whileHover={{ scale: 1.2 }}
    >
      {/* Diamond shape for inflection points */}
      <div
        className={`
          w-4 h-4 rotate-45 border-2 border-insight bg-field
          ${isSelected ? 'bg-insight' : 'group-hover:bg-insight/50'}
          transition-colors
        `}
      />
      <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs bg-field-subtle px-2 py-1 rounded text-ink-secondary">
          {point.label}
        </span>
      </div>
    </motion.button>
  )
}

// Emotional arc visualization
function EmotionalArc({
  trajectory,
  maxTime,
}: {
  trajectory: { time: number; intensity: number; note: string }[]
  maxTime: number
}) {
  const points = trajectory.map((p) => ({
    x: (p.time / maxTime) * 100,
    y: 100 - p.intensity * 100,
  }))

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ')

  return (
    <svg className="w-full h-24" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Grid lines */}
      <line x1="0" y1="50" x2="100" y2="50" stroke={BORDER_COLOR} strokeWidth="0.2" />
      <line x1="0" y1="25" x2="100" y2="25" stroke={BORDER_COLOR} strokeWidth="0.1" />
      <line x1="0" y1="75" x2="100" y2="75" stroke={BORDER_COLOR} strokeWidth="0.1" />

      {/* Gradient fill */}
      <defs>
        <linearGradient id="arcGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={MARCUS_COLOR} stopOpacity="0.3" />
          <stop offset="100%" stopColor={MARCUS_COLOR} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <path
        d={`${pathD} L ${points[points.length - 1]?.x || 100} 100 L ${points[0]?.x || 0} 100 Z`}
        fill="url(#arcGradient)"
      />

      {/* Line */}
      <path d={pathD} fill="none" stroke={MARCUS_COLOR} strokeWidth="0.5" />

      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1" fill={MARCUS_COLOR} />
      ))}
    </svg>
  )
}

// Phase detail sidebar
function PhaseDetail({ phase, onClose }: { phase: FlowPhase; onClose: () => void }) {
  return (
    <DetailPanel title={phase.label} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-ink-secondary mb-2">
            {formatTime(phase.start_time)} – {formatTime(phase.end_time)}
          </p>
          <p className="text-sm text-ink">{phase.summary}</p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-ink-tertiary mb-2">Mood</h4>
          <span className="capitalize text-sm text-ink">{phase.mood.replace(/_/g, ' ')}</span>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-ink-tertiary mb-2">
            Emotional Intensity
          </h4>
          <div className="h-2 bg-field-deep rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-marcus to-demartini"
              style={{ width: `${phase.emotional_intensity * 100}%` }}
            />
          </div>
          <p className="text-xs text-ink-tertiary mt-1">
            {Math.round(phase.emotional_intensity * 100)}%
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-ink-tertiary mb-2">Dominant Speaker</h4>
          <SpeakerBadge speaker={phase.dominant_speaker} />
        </div>

        {phase.key_claims.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-ink-tertiary mb-2">Key Claims</h4>
            <div className="flex flex-wrap gap-1">
              {phase.key_claims.map((c) => (
                <span
                  key={c}
                  className="text-xs bg-field-subtle px-2 py-0.5 rounded text-ink-secondary"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </DetailPanel>
  )
}

// Inflection point detail
function InflectionDetail({
  point,
  onClose,
}: {
  point: InflectionPoint
  onClose: () => void
}) {
  return (
    <DetailPanel title={`◆ ${point.label}`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-ink-secondary mb-2">{formatTime(point.timestamp)}</p>
          <p className="text-sm text-ink">{point.description}</p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-ink-tertiary mb-2">
            Road Not Taken
          </h4>
          <p className="text-sm italic text-ink">{point.road_not_taken}</p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-ink-tertiary mb-2">Impact</h4>
          <p className="text-sm text-ink">{point.impact}</p>
        </div>
      </div>
    </DetailPanel>
  )
}

export function DialecticalFlow() {
  const { data, loading, error } = useFlow()
  const [selectedPhase, setSelectedPhase] = useState<FlowPhase | null>(null)
  const [selectedInflection, setSelectedInflection] = useState<InflectionPoint | null>(null)

  const maxTime = useMemo(() => {
    if (!data) return 6330
    return data.metadata.total_duration_seconds
  }, [data])

  const sidebar = useMemo(() => {
    if (selectedInflection) {
      return (
        <InflectionDetail
          point={selectedInflection}
          onClose={() => setSelectedInflection(null)}
        />
      )
    }
    if (selectedPhase) {
      return (
        <PhaseDetail phase={selectedPhase} onClose={() => setSelectedPhase(null)} />
      )
    }
    return (
      <div className="card sticky top-24">
        <h3 className="font-display font-semibold text-ink mb-4">About This View</h3>
        <p className="text-sm text-ink-secondary mb-4">
          The Dialectical Flow shows how the conversation evolved over time. Click on
          phases to see details, or on the golden markers to explore inflection
          points—moments where the conversation could have gone differently.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rotate-45 bg-insight" />
            <span className="text-ink-secondary">Inflection Points</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 rounded bg-field-subtle border border-marcus/60" />
            <span className="text-ink-secondary">High Tension Phases</span>
          </div>
        </div>
      </div>
    )
  }, [selectedPhase, selectedInflection])

  return (
    <LensLayout
      title="Dialectical Flow"
      subtitle="Timeline of the conversation's intellectual and emotional arc"
      loading={loading}
      error={error}
      sidebar={sidebar}
    >
      {data && (
        <div className="space-y-8">
          {/* Emotional Arc */}
          <div className="card">
            <h3 className="text-sm font-medium text-ink-secondary mb-2">Emotional Intensity</h3>
            <EmotionalArc trajectory={data.emotional_arc.trajectory} maxTime={maxTime} />
            <p className="text-xs text-ink-tertiary mt-2">{data.emotional_arc.description}</p>
          </div>

          {/* Timeline */}
          <div className="card">
            <h3 className="text-sm font-medium text-ink-secondary mb-4">Conversation Phases</h3>

            {/* Time axis */}
            <div className="flex justify-between text-xs text-ink-tertiary mb-2">
              <span>0:00</span>
              <span>{formatTime(maxTime / 4)}</span>
              <span>{formatTime(maxTime / 2)}</span>
              <span>{formatTime((maxTime * 3) / 4)}</span>
              <span>{formatTime(maxTime)}</span>
            </div>

            {/* Phases track */}
            <div className="relative h-20 bg-field-deep rounded-lg mb-4">
              {data.phases.map((phase) => (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  isSelected={selectedPhase?.id === phase.id}
                  onClick={() => {
                    setSelectedInflection(null)
                    setSelectedPhase(selectedPhase?.id === phase.id ? null : phase)
                  }}
                  maxTime={maxTime}
                />
              ))}
            </div>

            {/* Inflection points track */}
            <div className="relative h-8">
              {data.inflection_points.map((point) => (
                <InflectionMarker
                  key={point.id}
                  point={point}
                  isSelected={selectedInflection?.id === point.id}
                  onClick={() => {
                    setSelectedPhase(null)
                    setSelectedInflection(
                      selectedInflection?.id === point.id ? null : point
                    )
                  }}
                  maxTime={maxTime}
                />
              ))}
            </div>
          </div>

          {/* Phase list */}
          <div className="card">
            <h3 className="text-sm font-medium text-ink-secondary mb-4">
              All Phases ({data.phases.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.phases.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => {
                    setSelectedInflection(null)
                    setSelectedPhase(phase)
                  }}
                  className={`
                    w-full text-left p-3 rounded-lg transition-all
                    ${selectedPhase?.id === phase.id
                      ? 'bg-field-deep border border-marcus/30'
                      : 'bg-field-subtle hover:bg-field-deep'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-ink">{phase.label}</span>
                    <span className="text-xs text-ink-tertiary">
                      {formatTime(phase.start_time)}
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary line-clamp-2">{phase.summary}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </LensLayout>
  )
}
