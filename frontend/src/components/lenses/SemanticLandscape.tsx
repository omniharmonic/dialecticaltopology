'use client'

import { useState, useMemo, useRef, Suspense, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { useLandscape } from '@/lib/useData'
import { LensLayout, DetailPanel, SpeakerBadge } from './LensLayout'
import type { LandscapePoint, LandscapeCluster } from '@/lib/types'

// Temporal visibility states
type TemporalState = 'future' | 'current' | 'past' | 'all'

// Design token colors for 3D materials (mirrors CSS custom properties)
// These must be JS values since Three.js materials don't support CSS variables
const MARCUS_SOFT = '#E8A892'      // --marcus-soft
const DEMARTINI_SOFT = '#8BBDD4'   // --demartini-soft
const CURRENT_HIGHLIGHT = '#FAFAFA' // --field (white-ish for current point)
const GRID_PRIMARY = '#0F3460'     // --deep-end
const GRID_SECONDARY = '#16213E'   // --deep-mid
const TRAJECTORY_COLOR = '#A0A0A0' // --ink-tertiary

// Point in 3D space with temporal support
function DataPoint({
  point,
  isSelected,
  isHovered,
  isCurrent,
  temporalState,
  onClick,
  onHover,
  scale = 1,
}: {
  point: LandscapePoint
  isSelected: boolean
  isHovered: boolean
  isCurrent: boolean
  temporalState: TemporalState
  onClick: () => void
  onHover: (hover: boolean) => void
  scale?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const color = point.speaker === 'marcus' ? MARCUS_SOFT : DEMARTINI_SOFT

  // Size based on duration (larger chunks = larger spheres)
  const baseSize = 0.05
  const durationFactor = point.duration ? Math.min(point.duration / 300, 1.5) : 1
  const size = baseSize * (0.7 + durationFactor * 0.5)

  // Temporal opacity and visibility - softer with feathered edges
  const getOpacity = () => {
    if (temporalState === 'all') return isSelected || isHovered ? 0.9 : 0.8
    if (temporalState === 'future') return 0.1
    if (temporalState === 'current') return 0.95
    if (temporalState === 'past') return 0.5
    return 0.8
  }

  useFrame(() => {
    if (meshRef.current) {
      // Gentle pulse for selected or current point
      if (isSelected || isCurrent) {
        meshRef.current.scale.setScalar(
          1.5 + Math.sin(Date.now() * 0.003) * 0.2
        )
      } else if (isHovered) {
        meshRef.current.scale.setScalar(1.3)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }
  })

  // Don't render future points in playback mode
  if (temporalState === 'future') return null

  return (
    <mesh
      ref={meshRef}
      position={[point.x * scale, point.y * scale, point.z * scale]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(true)
      }}
      onPointerOut={() => onHover(false)}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={isCurrent ? CURRENT_HIGHLIGHT : color}
        emissive={isCurrent ? CURRENT_HIGHLIGHT : color}
        emissiveIntensity={isCurrent ? 0.6 : isSelected ? 0.4 : isHovered ? 0.25 : 0.1}
        transparent
        opacity={getOpacity()}
      />
    </mesh>
  )
}

// Cluster label in 3D using Html (SSR-safe)
function ClusterLabel({
  cluster,
  scale = 1,
}: {
  cluster: LandscapeCluster
  scale?: number
}) {
  const [x, y, z] = cluster.centroid || [0, 0, 0]
  const isMarcus = cluster.speaker === 'marcus'

  // Truncate label for display
  const displayLabel = cluster.label?.length > 40
    ? cluster.label.slice(0, 40) + '...'
    : cluster.label

  return (
    <group position={[x * scale, y * scale + 0.15, z * scale]}>
      <Html center distanceFactor={1.5}>
        <div
          className={`text-xs whitespace-nowrap pointer-events-none select-none px-2 py-1 rounded bg-field/90 max-w-[200px] truncate ${
            isMarcus ? 'text-marcus border-l-2 border-marcus' : 'text-demartini border-l-2 border-demartini'
          }`}
        >
          {displayLabel}
        </div>
      </Html>
    </group>
  )
}

// Connection lines between temporally adjacent points
function Trajectory({
  points,
  scale = 1,
}: {
  points: LandscapePoint[]
  scale?: number
}) {
  const line = useMemo(() => {
    const sortedPoints = [...points].sort((a, b) => a.start_time - b.start_time)
    const positions = sortedPoints.flatMap((p) => [
      p.x * scale,
      p.y * scale,
      p.z * scale,
    ])
    const geo = new THREE.BufferGeometry()
    geo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    )
    const material = new THREE.LineBasicMaterial({
      color: TRAJECTORY_COLOR,
      opacity: 0.3,
      transparent: true,
    })
    return new THREE.Line(geo, material)
  }, [points, scale])

  return <primitive object={line} />
}

// Speaker centroid marker
function CentroidMarker({
  position,
  speaker,
  scale = 1,
}: {
  position: [number, number, number]
  speaker: 'marcus' | 'demartini'
  scale?: number
}) {
  const color = speaker === 'marcus' ? MARCUS_SOFT : DEMARTINI_SOFT
  const [x, y, z] = position

  return (
    <group position={[x * scale, y * scale, z * scale]}>
      <mesh>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          wireframe
        />
      </mesh>
      <group position={[0, 0.15, 0]}>
        <Html center distanceFactor={1.5}>
          <div
            className={`text-xs font-medium whitespace-nowrap pointer-events-none select-none ${
              speaker === 'marcus' ? 'text-marcus' : 'text-demartini'
            }`}
          >
            {speaker === 'marcus' ? 'Marcus' : 'Demartini'}
          </div>
        </Html>
      </group>
    </group>
  )
}

// Camera controls with auto-rotate option
function CameraController({ autoRotate }: { autoRotate: boolean }) {
  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.05}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
      minDistance={0.5}
      maxDistance={5}
    />
  )
}

// Loading fallback for Canvas
function CanvasLoader() {
  return (
    <Html center>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-ink-ghost border-t-ink rounded-full animate-spin mx-auto" />
        <p className="text-sm text-ink-secondary mt-2">Loading 3D...</p>
      </div>
    </Html>
  )
}

// The main 3D scene
function Scene({
  points,
  clusters,
  centroids,
  selectedPoint,
  hoveredPoint,
  currentTime,
  isPlaying,
  onSelectPoint,
  onHoverPoint,
  showTrajectory,
  showClusters,
  autoRotate,
}: {
  points: LandscapePoint[]
  clusters: LandscapeCluster[]
  centroids: {
    marcus: [number, number, number]
    demartini: [number, number, number]
  }
  selectedPoint: LandscapePoint | null
  hoveredPoint: LandscapePoint | null
  currentTime: number | null // null means show all
  isPlaying: boolean
  onSelectPoint: (point: LandscapePoint | null) => void
  onHoverPoint: (point: LandscapePoint | null) => void
  showTrajectory: boolean
  showClusters: boolean
  autoRotate: boolean
}) {
  const scale = 3 // Scale up for better visibility

  // Get temporal state for each point
  const getTemporalState = (point: LandscapePoint): TemporalState => {
    if (currentTime === null) return 'all'
    const pointEnd = point.time + (point.duration || 0)
    if (point.time > currentTime) return 'future'
    if (point.time <= currentTime && pointEnd >= currentTime) return 'current'
    return 'past'
  }

  // Find current point for highlighting
  const currentPoint = currentTime !== null
    ? points.find((p) => {
        const pointEnd = p.time + (p.duration || 0)
        return p.time <= currentTime && pointEnd >= currentTime
      })
    : null

  // Filter visible points for trajectory in playback mode
  const visiblePoints = currentTime !== null
    ? points.filter((p) => p.time <= currentTime)
    : points

  return (
    <>
      <PerspectiveCamera makeDefault position={[2, 1.5, 2]} fov={50} />
      <CameraController autoRotate={autoRotate && !isPlaying} />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />

      {/* Grid helper */}
      <gridHelper args={[2, 20, GRID_PRIMARY, GRID_SECONDARY]} position={[0, -0.5, 0]} />

      {/* Trajectory line - only show for visible points */}
      {showTrajectory && <Trajectory points={visiblePoints} scale={scale} />}

      {/* Data points */}
      {points.map((point) => (
        <DataPoint
          key={point.id}
          point={point}
          isSelected={selectedPoint?.id === point.id}
          isHovered={hoveredPoint?.id === point.id}
          isCurrent={currentPoint?.id === point.id}
          temporalState={getTemporalState(point)}
          onClick={() =>
            onSelectPoint(selectedPoint?.id === point.id ? null : point)
          }
          onHover={(hover) => onHoverPoint(hover ? point : null)}
          scale={scale}
        />
      ))}

      {/* Cluster labels - only show when not in playback mode */}
      {showClusters && currentTime === null &&
        clusters.map((cluster) => (
          <ClusterLabel key={cluster.id} cluster={cluster} scale={scale} />
        ))}

      {/* Speaker centroids */}
      <CentroidMarker position={centroids.marcus} speaker="marcus" scale={scale} />
      <CentroidMarker
        position={centroids.demartini}
        speaker="demartini"
        scale={scale}
      />
    </>
  )
}

// Point detail sidebar with conversation thread
function PointDetail({
  point,
  allPoints,
  clusters,
  onClose,
  onSelectPoint,
}: {
  point: LandscapePoint
  allPoints: LandscapePoint[]
  clusters: LandscapeCluster[]
  onClose: () => void
  onSelectPoint: (point: LandscapePoint) => void
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Find the cluster this point belongs to
  const cluster = clusters.find((c) => c.id === point.cluster_id)

  // Get conversation thread (surrounding points in time)
  const sortedPoints = [...allPoints].sort((a, b) => a.time - b.time)
  const currentIndex = sortedPoints.findIndex((p) => p.id === point.id)
  const threadStart = Math.max(0, currentIndex - 1)
  const threadEnd = Math.min(sortedPoints.length, currentIndex + 2)
  const conversationThread = sortedPoints.slice(threadStart, threadEnd)

  return (
    <DetailPanel title={`Segment ${point.time_range || point.time_label || ''}`} onClose={onClose}>
      <div className="space-y-4">
        {/* Cluster/Claim context */}
        {cluster && (
          <div className="p-3 rounded-lg bg-field-subtle border-l-2 border-marcus">
            <div className="text-xs uppercase tracking-wider text-ink-tertiary mb-1">
              Related Claim
            </div>
            <p className="text-sm text-ink">{cluster.full_claim || cluster.label}</p>
            {point.cluster_similarity && (
              <div className="mt-2 text-xs text-ink-tertiary">
                Semantic similarity: {(point.cluster_similarity * 100).toFixed(0)}%
              </div>
            )}
          </div>
        )}

        {/* Main content */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SpeakerBadge speaker={point.speaker} />
            <span className="text-xs text-ink-tertiary">
              {point.time_range || point.time_label || formatTime(point.time || 0)}
            </span>
            {point.duration && (
              <span className="text-xs text-ink-ghost">
                ({Math.round(point.duration / 60)} min)
              </span>
            )}
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
            {point.full_text || point.text}
          </div>
        </div>

        {/* Conversation Thread */}
        {conversationThread.length > 1 && (
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-tertiary mb-2">
              Conversation Thread
            </div>
            <div className="space-y-2">
              {conversationThread.map((p) => (
                <button
                  key={p.id}
                  onClick={() => p.id !== point.id && onSelectPoint(p)}
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    p.id === point.id
                      ? 'bg-field-deep ring-1 ring-border-active'
                      : 'bg-field-subtle hover:bg-field-deep'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <SpeakerBadge speaker={p.speaker} />
                    <span className="text-xs text-ink-tertiary">{p.time_label}</span>
                    {p.id === point.id && (
                      <span className="text-xs text-marcus">(current)</span>
                    )}
                  </div>
                  <p className="text-xs text-ink-secondary line-clamp-2">{p.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Related claims */}
        {point.related_claims && point.related_claims.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-tertiary mb-2">
              Also Related To
            </div>
            <div className="space-y-1">
              {point.related_claims.slice(0, 3).map((rc) => {
                const relatedCluster = clusters.find((c) => c.id === rc.claim_id)
                return (
                  <div key={rc.claim_id} className="text-xs text-ink-secondary flex items-center gap-2">
                    <span className="text-ink-ghost">{(rc.similarity * 100).toFixed(0)}%</span>
                    <span className="truncate">{relatedCluster?.label || rc.claim_id}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </DetailPanel>
  )
}

// Playback controls component
function PlaybackControls({
  currentTime,
  maxTime,
  isPlaying,
  playbackSpeed,
  onTimeChange,
  onPlayPause,
  onReset,
  onSpeedChange,
  currentPoint,
}: {
  currentTime: number
  maxTime: number
  isPlaying: boolean
  playbackSpeed: number
  onTimeChange: (time: number) => void
  onPlayPause: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
  currentPoint: LandscapePoint | null
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="card rounded-xl p-4">
      {/* Current point info */}
      {currentPoint && (
        <div className="mb-3 p-2 rounded bg-field-subtle">
          <div className="flex items-center gap-2 mb-1">
            <SpeakerBadge speaker={currentPoint.speaker} />
            <span className="text-xs text-ink-tertiary">{currentPoint.time_range || currentPoint.time_label}</span>
          </div>
          <p className="text-xs text-ink-secondary line-clamp-2">{currentPoint.text}</p>
        </div>
      )}

      {/* Timeline scrubber */}
      <div className="mb-3">
        <input
          type="range"
          min={0}
          max={maxTime}
          value={currentTime}
          onChange={(e) => onTimeChange(Number(e.target.value))}
          className="w-full h-2 bg-field-deep rounded-lg appearance-none cursor-pointer accent-marcus"
        />
        <div className="flex justify-between text-xs text-ink-tertiary mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(maxTime)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="btn-ghost p-2 rounded"
          title="Reset"
        >
          ⏮
        </button>
        <button
          onClick={onPlayPause}
          className="flex-1 py-2 rounded bg-marcus-faint hover:bg-marcus-soft/30 text-marcus font-medium transition-colors"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <select
          value={playbackSpeed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="p-2 rounded bg-field-deep text-sm border-0 text-ink"
          title="Playback speed"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
          <option value={8}>8x</option>
        </select>
      </div>
    </div>
  )
}

export function SemanticLandscape() {
  const { data, loading, error } = useLandscape()
  const [selectedPoint, setSelectedPoint] = useState<LandscapePoint | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<LandscapePoint | null>(null)
  const [showTrajectory, setShowTrajectory] = useState(true)
  const [showClusters, setShowClusters] = useState(true)
  const [autoRotate, setAutoRotate] = useState(false)
  const [speakerFilter, setSpeakerFilter] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Temporal playback state
  const [viewMode, setViewMode] = useState<'static' | 'temporal'>('static')
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(4) // 4x speed default

  // Get max time from data
  const maxTime = useMemo(() => {
    if (!data?.points?.length) return 6300 // ~1h45m default
    const lastPoint = [...data.points].sort((a, b) => b.time - a.time)[0]
    return lastPoint.time + (lastPoint.duration || 120)
  }, [data])

  // Playback animation
  useEffect(() => {
    if (!isPlaying || viewMode !== 'temporal') return

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + (100 * playbackSpeed) / 1000 * 10 // 10 seconds per tick at 1x
        if (next >= maxTime) {
          setIsPlaying(false)
          return maxTime
        }
        return next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, maxTime, viewMode])

  // Find current point for playback display
  const currentPlaybackPoint = useMemo(() => {
    if (viewMode !== 'temporal' || !data?.points) return null
    return data.points.find((p) => {
      const pointEnd = p.time + (p.duration || 0)
      return p.time <= currentTime && pointEnd >= currentTime
    }) || null
  }, [data, currentTime, viewMode])

  // Ensure we only render the 3D canvas on the client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const filteredPoints = useMemo(() => {
    if (!data) return []
    if (!speakerFilter) return data.points
    return data.points.filter((p) => p.speaker === speakerFilter)
  }, [data, speakerFilter])

  const sidebar = useMemo(() => {
    if (selectedPoint && data) {
      return (
        <PointDetail
          point={selectedPoint}
          allPoints={data.points}
          clusters={data.clusters || []}
          onClose={() => setSelectedPoint(null)}
          onSelectPoint={setSelectedPoint}
        />
      )
    }

    return (
      <div className="space-y-4 sticky top-24">
        {/* View Mode Toggle */}
        <div className="card rounded-xl p-4">
          <h3 className="font-display font-semibold mb-3">View Mode</h3>
          <div className="flex gap-1">
            <button
              onClick={() => {
                setViewMode('static')
                setIsPlaying(false)
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'static'
                  ? 'bg-marcus-faint text-marcus'
                  : 'bg-field-deep text-ink-secondary hover:bg-field-subtle'
              }`}
            >
              Static
            </button>
            <button
              onClick={() => setViewMode('temporal')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'temporal'
                  ? 'bg-marcus-faint text-marcus'
                  : 'bg-field-deep text-ink-secondary hover:bg-field-subtle'
              }`}
            >
              4D Playback
            </button>
          </div>
          <p className="text-xs text-ink-tertiary mt-2">
            {viewMode === 'static'
              ? 'Explore all segments at once'
              : 'Watch the conversation unfold over time'}
          </p>
        </div>

        {/* Playback Controls (only in temporal mode) */}
        {viewMode === 'temporal' && data && (
          <PlaybackControls
            currentTime={currentTime}
            maxTime={maxTime}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onTimeChange={setCurrentTime}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onReset={() => {
              setCurrentTime(0)
              setIsPlaying(false)
            }}
            onSpeedChange={setPlaybackSpeed}
            currentPoint={currentPlaybackPoint}
          />
        )}

        <div className="card rounded-xl p-4">
          <h3 className="font-display font-semibold mb-4">About This View</h3>
          <p className="text-sm text-ink-secondary mb-4">
            {data?.metadata?.statistics?.total_chunks || data?.points?.length || 0} conversation segments
            organized into {data?.clusters?.length || 0} claim-based clusters.
            Each cluster represents discussion around a specific philosophical claim.
            Click any point to explore the conversation thread.
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-marcus" />
              <span className="text-ink-secondary">Marcus (Host)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-demartini" />
              <span className="text-ink-secondary">Demartini (Guest)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rotate-45 border border-ink-tertiary" style={{ width: 10, height: 10 }} />
              <span className="text-ink-secondary">Speaker Centroid</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="card rounded-xl p-4">
          <h4 className="text-sm font-semibold mb-3">Display Options</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showTrajectory}
                onChange={(e) => setShowTrajectory(e.target.checked)}
                className="rounded bg-field-deep border-0"
              />
              <span className="text-ink-secondary">Show trajectory</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showClusters}
                onChange={(e) => setShowClusters(e.target.checked)}
                className="rounded bg-field-deep border-0"
              />
              <span className="text-ink-secondary">Show claim labels</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="rounded bg-field-deep border-0"
              />
              <span className="text-ink-secondary">Auto-rotate</span>
            </label>
          </div>

          <div className="mt-4">
            <h4 className="text-xs uppercase tracking-wider text-ink-tertiary mb-2">
              Filter by Speaker
            </h4>
            <div className="flex gap-1">
              <button
                onClick={() => setSpeakerFilter(null)}
                className={`pill ${!speakerFilter ? 'pill-active' : ''}`}
              >
                All
              </button>
              <button
                onClick={() => setSpeakerFilter('marcus')}
                className={`pill ${speakerFilter === 'marcus' ? 'bg-marcus-faint text-marcus' : ''}`}
              >
                Marcus
              </button>
              <button
                onClick={() => setSpeakerFilter('demartini')}
                className={`pill ${speakerFilter === 'demartini' ? 'bg-demartini-faint text-demartini' : ''}`}
              >
                Demartini
              </button>
            </div>
          </div>
        </div>

        {/* Top Clusters */}
        {data && data.clusters && data.clusters.length > 0 && (
          <div className="card rounded-xl p-4">
            <h4 className="text-sm font-semibold mb-3">Top Discussion Topics</h4>
            <div className="space-y-2">
              {data.clusters.slice(0, 5).map((cluster) => (
                <div
                  key={cluster.id}
                  className={`text-xs p-2 rounded bg-field-subtle ${
                    cluster.speaker === 'marcus' ? 'accent-marcus' : 'accent-demartini'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-medium ${
                        cluster.speaker === 'marcus' ? 'text-marcus' : 'text-demartini'
                      }`}
                    >
                      {cluster.speaker === 'marcus' ? 'M' : 'D'}
                    </span>
                    <span className="text-ink-tertiary">{cluster.chunk_count || cluster.count} segments</span>
                  </div>
                  <p className="text-ink-secondary line-clamp-2">{cluster.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data && (
          <div className="card rounded-xl p-4">
            <h4 className="text-sm font-semibold mb-3">Statistics</h4>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-ink-tertiary">Total segments</span>
                <span>{data.points.length}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-ink-tertiary">Claim clusters</span>
                <span>{data.clusters?.length || 0}</span>
              </p>
              {data.metadata?.statistics?.avg_duration_seconds && (
                <p className="flex justify-between">
                  <span className="text-ink-tertiary">Avg segment length</span>
                  <span>{Math.round(data.metadata.statistics.avg_duration_seconds / 60)} min</span>
                </p>
              )}
              <p className="flex justify-between">
                <span className="text-ink-tertiary">Marcus segments</span>
                <span>{data.points.filter((p) => p.speaker === 'marcus').length}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-ink-tertiary">Demartini segments</span>
                <span>{data.points.filter((p) => p.speaker === 'demartini').length}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }, [selectedPoint, data, showTrajectory, showClusters, autoRotate, speakerFilter, viewMode, currentTime, isPlaying, playbackSpeed, maxTime, currentPlaybackPoint])

  // Find cluster for hovered point
  const hoveredCluster = hoveredPoint && data?.clusters?.find((c) => c.id === hoveredPoint.cluster_id)

  // Hover tooltip
  const hoverInfo = hoveredPoint && !selectedPoint && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 card rounded-lg p-4 max-w-lg"
    >
      <div className="flex items-center gap-2 mb-2">
        <SpeakerBadge speaker={hoveredPoint.speaker} />
        <span className="text-xs text-ink-tertiary">{hoveredPoint.time_range || hoveredPoint.time_label}</span>
        {hoveredPoint.duration && (
          <span className="text-xs text-ink-ghost">({Math.round(hoveredPoint.duration / 60)} min)</span>
        )}
      </div>
      <p className="text-sm line-clamp-3 mb-2">{hoveredPoint.text}</p>
      {hoveredCluster && (
        <div className="text-xs text-ink-tertiary border-t border-border pt-2">
          <span className="text-ink-secondary">Claim:</span> {hoveredCluster.label?.slice(0, 60)}...
        </div>
      )}
    </motion.div>
  )

  return (
    <LensLayout
      title="Semantic Landscape"
      subtitle="Navigate the 3D terrain of meaning"
      loading={loading}
      error={error}
      sidebar={sidebar}
    >
      {data && data.speaker_centroids && (
        <div className="relative">
          <div className="canvas-container canvas-deep rounded-xl overflow-hidden" style={{ height: '70vh' }}>
            {isMounted ? (
              <Canvas>
                <Suspense fallback={<CanvasLoader />}>
                  <Scene
                    points={filteredPoints}
                    clusters={data.clusters || []}
                    centroids={data.speaker_centroids}
                    selectedPoint={selectedPoint}
                    hoveredPoint={hoveredPoint}
                    currentTime={viewMode === 'temporal' ? currentTime : null}
                    isPlaying={isPlaying}
                    onSelectPoint={setSelectedPoint}
                    onHoverPoint={setHoveredPoint}
                    showTrajectory={showTrajectory}
                    showClusters={showClusters}
                    autoRotate={autoRotate}
                  />
                </Suspense>
              </Canvas>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-ink-ghost border-t-ink rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-ink-secondary mt-2">Loading 3D...</p>
                </div>
              </div>
            )}
          </div>

          {/* Interaction hint */}
          <div className="absolute bottom-4 left-4 text-xs text-ink-tertiary">
            <p>Drag to rotate - Scroll to zoom - Click points for details</p>
          </div>

          {hoverInfo}
        </div>
      )}
    </LensLayout>
  )
}
