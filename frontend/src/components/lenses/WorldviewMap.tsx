'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOntology } from '@/lib/useData'
import { LensLayout, DetailPanel, SpeakerBadge } from './LensLayout'
import type { OntologyDimension } from '@/lib/types'

// Dimension visualization - horizontal spectrum
function DimensionSpectrum({
  dimension,
  isSelected,
  onClick,
}: {
  dimension: OntologyDimension
  isSelected: boolean
  onClick: () => void
}) {
  const demartiniPos = dimension.positions.demartini.position * 100
  const marcusPos = dimension.positions.marcus.position * 100
  const gap = dimension.gap_analysis.gap_size * 100

  const gapColor =
    gap > 50 ? 'text-red-400' : gap > 30 ? 'text-yellow-400' : 'text-green-400'

  return (
    <motion.button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-xl transition-all
        ${isSelected ? 'bg-white/10 ring-1 ring-marcus/50' : 'bg-void-200 hover:bg-void-100'}
      `}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-medium">{dimension.label}</h3>
        <span className={`text-xs ${gapColor}`}>Gap: {Math.round(gap)}%</span>
      </div>

      <p className="text-xs text-gray-500 mb-3 italic">{dimension.question}</p>

      {/* Spectrum visualization */}
      <div className="relative">
        {/* Labels */}
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span className="max-w-[40%] truncate">{dimension.spectrum.left.label}</span>
          <span className="max-w-[40%] truncate text-right">
            {dimension.spectrum.right.label}
          </span>
        </div>

        {/* Track */}
        <div className="relative h-6 bg-void-100 rounded-full overflow-hidden">
          {/* Gap indicator */}
          <div
            className="absolute top-0 h-full bg-white/5"
            style={{
              left: `${Math.min(demartiniPos, marcusPos)}%`,
              width: `${Math.abs(marcusPos - demartiniPos)}%`,
            }}
          />

          {/* Demartini marker */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-demartini border-2 border-white/50 z-10"
            style={{ left: `${demartiniPos}%` }}
            animate={{ x: '-50%' }}
          />

          {/* Marcus marker */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-marcus border-2 border-white/50 z-10"
            style={{ left: `${marcusPos}%` }}
            animate={{ x: '-50%' }}
          />
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-demartini" /> Demartini
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-marcus" /> Marcus
          </span>
        </div>
      </div>
    </motion.button>
  )
}

// Radar chart visualization
function RadarChart({ dimensions }: { dimensions: OntologyDimension[] }) {
  const size = 280
  const center = size / 2
  const radius = size * 0.4
  const n = dimensions.length

  // Calculate points for each speaker
  const getPoints = (speaker: 'marcus' | 'demartini') => {
    return dimensions.map((d, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2
      const value = d.positions[speaker].position
      const r = value * radius
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      }
    })
  }

  const marcusPoints = getPoints('marcus')
  const demartiniPoints = getPoints('demartini')

  const pointsToPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z'

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Grid circles */}
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <circle
          key={r}
          cx={center}
          cy={center}
          r={radius * r}
          fill="none"
          stroke="#374151"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
      ))}

      {/* Axis lines and labels */}
      {dimensions.map((d, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2
        const x2 = center + radius * Math.cos(angle)
        const y2 = center + radius * Math.sin(angle)
        const labelX = center + (radius + 20) * Math.cos(angle)
        const labelY = center + (radius + 20) * Math.sin(angle)

        return (
          <g key={d.id}>
            <line
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="#4b5563"
              strokeWidth="0.5"
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-500 text-[8px]"
            >
              {d.label.split(' ').slice(0, 2).join(' ')}
            </text>
          </g>
        )
      })}

      {/* Demartini area */}
      <path
        d={pointsToPath(demartiniPoints)}
        fill="#14b8a6"
        fillOpacity="0.2"
        stroke="#14b8a6"
        strokeWidth="2"
      />

      {/* Marcus area */}
      <path
        d={pointsToPath(marcusPoints)}
        fill="#f59e0b"
        fillOpacity="0.2"
        stroke="#f59e0b"
        strokeWidth="2"
      />

      {/* Points */}
      {demartiniPoints.map((p, i) => (
        <circle key={`d-${i}`} cx={p.x} cy={p.y} r="4" fill="#14b8a6" />
      ))}
      {marcusPoints.map((p, i) => (
        <circle key={`m-${i}`} cx={p.x} cy={p.y} r="4" fill="#f59e0b" />
      ))}
    </svg>
  )
}

// Dimension detail panel
function DimensionDetail({
  dimension,
  onClose,
}: {
  dimension: OntologyDimension
  onClose: () => void
}) {
  const bridgingColors: Record<string, string> = {
    high: 'text-green-400',
    medium: 'text-yellow-400',
    low: 'text-red-400',
  }

  return (
    <DetailPanel title={dimension.label} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm italic text-gray-400">{dimension.question}</p>

        {/* Spectrum ends */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-void-200 rounded">
            <p className="font-medium text-demartini">
              {dimension.spectrum.left.label}
            </p>
            <p className="text-gray-500 mt-1">{dimension.spectrum.left.description}</p>
          </div>
          <div className="p-2 bg-void-200 rounded">
            <p className="font-medium text-marcus">{dimension.spectrum.right.label}</p>
            <p className="text-gray-500 mt-1">
              {dimension.spectrum.right.description}
            </p>
          </div>
        </div>

        {/* Demartini position */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-demartini mb-2">
            Demartini's Position ({Math.round(dimension.positions.demartini.position * 100)}%)
          </h4>
          <p className="text-sm text-gray-300">
            {dimension.positions.demartini.summary}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {dimension.positions.demartini.key_claims.map((c) => (
              <span key={c} className="text-xs bg-demartini/20 text-demartini px-2 py-0.5 rounded">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Marcus position */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-marcus mb-2">
            Marcus's Position ({Math.round(dimension.positions.marcus.position * 100)}%)
          </h4>
          <p className="text-sm text-gray-300">{dimension.positions.marcus.summary}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {dimension.positions.marcus.key_claims.map((c) => (
              <span key={c} className="text-xs bg-marcus/20 text-marcus px-2 py-0.5 rounded">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Gap analysis */}
        <div className="p-3 bg-void-100 rounded-lg">
          <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
            Gap Analysis
          </h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-500">Type:</span>{' '}
              {dimension.gap_analysis.gap_type.replace(/_/g, ' ')}
            </p>
            <p>
              <span className="text-gray-500">Gap Size:</span>{' '}
              {Math.round(dimension.gap_analysis.gap_size * 100)}%
            </p>
            <p>
              <span className="text-gray-500">Bridging Potential:</span>{' '}
              <span className={bridgingColors[dimension.gap_analysis.bridging_potential] || ''}>
                {dimension.gap_analysis.bridging_potential}
              </span>
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-2 italic">
            {dimension.gap_analysis.notes}
          </p>
        </div>
      </div>
    </DetailPanel>
  )
}

export function WorldviewMap() {
  const { data, loading, error } = useOntology()
  const [selectedDimension, setSelectedDimension] = useState<OntologyDimension | null>(null)
  const [viewMode, setViewMode] = useState<'spectrum' | 'radar'>('spectrum')

  const sidebar = useMemo(() => {
    if (selectedDimension) {
      return (
        <DimensionDetail
          dimension={selectedDimension}
          onClose={() => setSelectedDimension(null)}
        />
      )
    }

    return (
      <div className="glass-panel rounded-xl p-4 sticky top-24">
        <h3 className="font-display font-semibold mb-4">About This View</h3>
        <p className="text-sm text-gray-400 mb-4">
          The Worldview Map shows how each speaker positions themselves on 8
          fundamental philosophical dimensions. Click any dimension to explore the
          details of their disagreement.
        </p>

        {data && (
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-gray-500">Key Insights</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              {data.synthesis.bridging_insights.slice(0, 3).map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>

            <h4 className="text-xs uppercase tracking-wider text-gray-500 mt-4">
              Irreconcilable
            </h4>
            <ul className="text-sm text-gray-400 space-y-2">
              {data.synthesis.irreconcilable_differences.slice(0, 2).map((diff, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span>{diff}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }, [selectedDimension, data])

  return (
    <LensLayout
      title="Worldview Map"
      subtitle="8-dimensional comparison of philosophical positions"
      loading={loading}
      error={error}
      sidebar={sidebar}
    >
      {data && (
        <div className="space-y-6">
          {/* View toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('spectrum')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                viewMode === 'spectrum'
                  ? 'bg-marcus/20 text-marcus'
                  : 'bg-void-200 text-gray-400 hover:text-white'
              }`}
            >
              Spectrum View
            </button>
            <button
              onClick={() => setViewMode('radar')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                viewMode === 'radar'
                  ? 'bg-marcus/20 text-marcus'
                  : 'bg-void-200 text-gray-400 hover:text-white'
              }`}
            >
              Radar View
            </button>
          </div>

          {viewMode === 'radar' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel rounded-xl p-6"
            >
              <RadarChart dimensions={data.dimensions} />
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-demartini" />
                  Demartini
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-marcus" />
                  Marcus
                </span>
              </div>
            </motion.div>
          )}

          {/* Dimension cards */}
          <div className={viewMode === 'radar' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}>
            {data.dimensions.map((dimension) => (
              <DimensionSpectrum
                key={dimension.id}
                dimension={dimension}
                isSelected={selectedDimension?.id === dimension.id}
                onClick={() =>
                  setSelectedDimension(
                    selectedDimension?.id === dimension.id ? null : dimension
                  )
                }
              />
            ))}
          </div>

          {/* Core tension */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-display font-semibold mb-2">Core Tension</h3>
            <p className="text-sm text-gray-300">{data.synthesis.core_tension}</p>
            <p className="text-sm text-gray-400 mt-2">{data.synthesis.domain_confusion}</p>
          </div>
        </div>
      )}
    </LensLayout>
  )
}
