'use client'

import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import type { HierarchyPointNode } from 'd3'
import { useTree } from '@/lib/useData'
import { LensLayout, DetailPanel } from './LensLayout'
import type { TreeNode, SynthesisNode, SemanticDrift } from '@/lib/types'

// Extended TreeNode type for D3 hierarchy (includes children array)
interface TreeNodeWithChildren extends TreeNode {
  children: TreeNodeWithChildren[]
}

// Design token colors for SVG (matching CSS variables)
const MARCUS_COLOR = '#C45A3C'
const DEMARTINI_COLOR = '#2E6B8A'
const CONVERGENCE_COLOR = '#7B6FA0'
const INSIGHT_COLOR = '#D4A853'
const BORDER_COLOR = '#E8E8E6'
const NEUTRAL_COLOR = '#94A3B8'

/**
 * Get the fill color for a node based on its type and speaker
 * Uses design token colors with appropriate semantic meaning
 */
const getNodeColor = (node: TreeNode): string => {
  // Root gets the insight/gold color
  if (node.type === 'root') return INSIGHT_COLOR
  // Category nodes get neutral gray
  if (node.type === 'category') return NEUTRAL_COLOR
  // Synthesis nodes get convergence purple
  if (node.type === 'synthesis') return CONVERGENCE_COLOR
  // Speaker-attributed nodes get their speaker colors
  if (node.speaker === 'marcus') return MARCUS_COLOR
  if (node.speaker === 'demartini') return DEMARTINI_COLOR
  if (node.speaker === 'shared') return CONVERGENCE_COLOR
  // Default fallback
  return NEUTRAL_COLOR
}

/**
 * Get the node radius based on type
 * Root and category nodes are larger for visual hierarchy
 */
const getNodeRadius = (node: TreeNode): number => {
  switch (node.type) {
    case 'root': return 14
    case 'category': return 10
    case 'synthesis': return 8
    case 'branch': return 6
    case 'claim': return 5
    default: return 5
  }
}

/**
 * Check if a node should display its label
 * Root, category, and synthesis nodes show labels
 */
const shouldShowLabel = (node: TreeNode): boolean => {
  return node.type === 'root' || node.type === 'category' || node.type === 'synthesis'
}

/**
 * Get all ancestor node IDs for lineage highlighting
 */
const getAncestorIds = (node: HierarchyPointNode<TreeNodeWithChildren>): Set<string> => {
  const ancestors = new Set<string>()
  let current = node.parent
  while (current) {
    ancestors.add(current.data.id)
    current = current.parent
  }
  return ancestors
}

/**
 * Create a bezier curve path between parent and child nodes
 * Uses cubic bezier with control points at vertical midpoint for organic curves
 */
const createBranchPath = (
  parent: { x: number; y: number },
  child: { x: number; y: number }
): string => {
  const midY = (parent.y + child.y) / 2
  return `M ${parent.x} ${parent.y} C ${parent.x} ${midY}, ${child.x} ${midY}, ${child.x} ${child.y}`
}

/**
 * Get color for relationship edge based on type
 * Uses design tokens for semantic meaning
 */
const getRelationshipEdgeColor = (type: string): string => {
  switch (type) {
    case 'agreement': return CONVERGENCE_COLOR
    case 'tension': return MARCUS_COLOR
    case 'contradiction': return MARCUS_COLOR
    case 'paradox': return INSIGHT_COLOR
    default: return BORDER_COLOR
  }
}

/**
 * Get opacity for relationship edge based on type
 * Design doc: agreement 30%, tension 25%, contradiction 30%, paradox 40%
 */
const getRelationshipEdgeOpacity = (type: string): number => {
  switch (type) {
    case 'agreement': return 0.3
    case 'tension': return 0.25
    case 'contradiction': return 0.3
    case 'paradox': return 0.4
    default: return 0.2
  }
}

// Node type for selection
type SelectedNode = {
  type: 'node' | 'synthesis' | 'drift'
  data: TreeNode | SynthesisNode | SemanticDrift
}

// Layout constants
const SVG_WIDTH = 1000
const SVG_HEIGHT = 600
const MARGIN = { top: 40, right: 80, bottom: 40, left: 80 }

/**
 * Convert flat nodes array to D3 hierarchy structure
 * Builds parent-child relationships from parent_id references
 */
const buildHierarchy = (nodes: TreeNode[]): d3.HierarchyNode<TreeNodeWithChildren> | null => {
  const root = nodes.find(n => n.parent_id === null)
  if (!root) return null

  // Create a map of all nodes with empty children arrays
  const nodeMap = new Map<string, TreeNodeWithChildren>(
    nodes.map(n => [n.id, { ...n, children: [] }])
  )

  // Build parent-child relationships
  nodes.forEach(node => {
    if (node.parent_id && nodeMap.has(node.parent_id)) {
      const parent = nodeMap.get(node.parent_id)!
      const child = nodeMap.get(node.id)!
      parent.children.push(child)
    }
  })

  const rootWithChildren = nodeMap.get(root.id)!
  return d3.hierarchy(rootWithChildren)
}

export function EpistemologicalTree() {
  const { data, loading, error } = useTree()
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [hoveredLineage, setHoveredLineage] = useState<Set<string>>(new Set())
  const svgRef = useRef<SVGSVGElement>(null)
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  // Zoom and pan transform state
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })

  // State for computed D3 positions
  const [nodePositions, setNodePositions] = useState<HierarchyPointNode<TreeNodeWithChildren>[]>([])

  // Handle node hover with lineage tracking
  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNode(nodeId)
    if (nodeId) {
      const node = nodePositions.find(n => n.data.id === nodeId)
      if (node) {
        setHoveredLineage(getAncestorIds(node))
      }
    } else {
      setHoveredLineage(new Set())
    }
  }, [nodePositions])

  // Check if a node is in the current hover lineage (including the hovered node itself)
  const isInLineage = useCallback((nodeId: string): boolean => {
    return hoveredNode === nodeId || hoveredLineage.has(nodeId)
  }, [hoveredNode, hoveredLineage])

  // Calculate tree layout when data changes
  useEffect(() => {
    if (!data || !svgRef.current) return

    // Build hierarchy from flat nodes
    const hierarchy = buildHierarchy(data.nodes)
    if (!hierarchy) return

    // Create D3 tree layout
    // Use available space minus margins
    const treeWidth = SVG_WIDTH - MARGIN.left - MARGIN.right
    const treeHeight = SVG_HEIGHT - MARGIN.top - MARGIN.bottom

    const treeLayout = d3.tree<TreeNodeWithChildren>()
      .size([treeWidth, treeHeight])
      .separation((a, b) => {
        // More separation between nodes with different parents
        // Helps visualize distinct branches
        return a.parent === b.parent ? 1 : 1.5
      })

    // Apply layout to hierarchy - this calculates x,y positions
    const root = treeLayout(hierarchy)

    // Store all positioned nodes (descendants includes root)
    setNodePositions(root.descendants())
  }, [data])

  // Filter relationship edges (non-hierarchy connections between claims)
  const relationshipEdges = useMemo(() => {
    if (!data) return []
    return data.edges.filter(e => e.type !== 'hierarchy')
  }, [data])

  // Create lookup map for node positions by ID
  const nodePositionMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    nodePositions.forEach(n => map.set(n.data.id, { x: n.x, y: n.y }))
    return map
  }, [nodePositions])

  // Zoom behavior setup - enables pinch/scroll zoom and drag pan
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3]) // Min 0.5x, max 3x zoom
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k
        })
      })

    svg.call(zoomBehavior)

    // Store zoom behavior for keyboard controls
    zoomBehaviorRef.current = zoomBehavior

    return () => {
      svg.on('.zoom', null) // Cleanup zoom listeners
    }
  }, [])

  // Keyboard controls for zoom and selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Escape: Deselect current node
      if (e.key === 'Escape') {
        setSelectedNode(null)
      }
      // +/=: Zoom in - use D3's scaleBy to keep state synced
      if (e.key === '+' || e.key === '=') {
        if (svgRef.current && zoomBehaviorRef.current) {
          const svg = d3.select(svgRef.current)
          svg.transition().duration(200).call(zoomBehaviorRef.current.scaleBy, 1.2)
        }
      }
      // -: Zoom out - use D3's scaleBy to keep state synced
      if (e.key === '-') {
        if (svgRef.current && zoomBehaviorRef.current) {
          const svg = d3.select(svgRef.current)
          svg.transition().duration(200).call(zoomBehaviorRef.current.scaleBy, 1 / 1.2)
        }
      }
      // 0: Reset zoom and pan - use D3's transform to keep state synced
      if (e.key === '0') {
        if (svgRef.current && zoomBehaviorRef.current) {
          const svg = d3.select(svgRef.current)
          svg.transition().duration(200).call(zoomBehaviorRef.current.transform, d3.zoomIdentity)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Sidebar content
  const sidebar = useMemo(() => {
    if (selectedNode) {
      const getTitle = () => {
        switch (selectedNode.type) {
          case 'node':
            return (selectedNode.data as TreeNode).label
          case 'synthesis':
            return (selectedNode.data as SynthesisNode).label
          case 'drift':
            return `"${(selectedNode.data as SemanticDrift).term}"`
        }
      }

      return (
        <DetailPanel title={getTitle()} onClose={() => setSelectedNode(null)}>
          {selectedNode.type === 'node' && (
            <div className="space-y-3">
              <div className="text-sm text-ink-secondary">
                <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-1">
                  Type
                </span>
                <span className="capitalize">{(selectedNode.data as TreeNode).type}</span>
              </div>
              {(selectedNode.data as TreeNode).speaker && (
                <div className="text-sm text-ink-secondary">
                  <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-1">
                    Speaker
                  </span>
                  <span className="capitalize">{(selectedNode.data as TreeNode).speaker}</span>
                </div>
              )}
              <div className="text-sm text-ink-secondary">
                <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-1">
                  Depth
                </span>
                Level {(selectedNode.data as TreeNode).depth}
              </div>
            </div>
          )}
          {selectedNode.type === 'synthesis' && (
            <div className="space-y-3">
              <p className="text-sm text-ink-secondary">
                {(selectedNode.data as SynthesisNode).synthesis_text}
              </p>
              <div>
                <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-1">
                  Contributing Claims
                </span>
                <div className="flex flex-wrap gap-1">
                  {(selectedNode.data as SynthesisNode).contributing_claims.map((id) => (
                    <span
                      key={id}
                      className="text-xs bg-field-subtle px-2 py-0.5 rounded font-mono"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {selectedNode.type === 'drift' && (
            <div className="space-y-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-1">
                  Marcus's Meaning
                </span>
                <p className="text-sm text-ink-secondary">
                  {(selectedNode.data as SemanticDrift).marcus_meaning}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-1">
                  Demartini's Meaning
                </span>
                <p className="text-sm text-ink-secondary">
                  {(selectedNode.data as SemanticDrift).demartini_meaning}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-1">
                  Affected Claims
                </span>
                <div className="flex flex-wrap gap-1">
                  {(selectedNode.data as SemanticDrift).affected_claims.map((id) => (
                    <span
                      key={id}
                      className="text-xs bg-field-subtle px-2 py-0.5 rounded font-mono"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DetailPanel>
      )
    }

    return (
      <div className="card sticky top-24">
        <h3 className="font-display font-semibold text-ink mb-4">About This View</h3>
        <p className="text-sm text-ink-secondary mb-4">
          The Epistemological Tree maps philosophical claims to their foundational roots,
          revealing the chain of thought and underlying worldview assumptions.
        </p>

        {/* Legend */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-ink-tertiary">Legend</h4>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: DEMARTINI_COLOR }}
            />
            <span className="text-sm text-ink-secondary">Demartini</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: MARCUS_COLOR }}
            />
            <span className="text-sm text-ink-secondary">Marcus</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: CONVERGENCE_COLOR }}
            />
            <span className="text-sm text-ink-secondary">Synthesis</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3"
              style={{
                backgroundColor: INSIGHT_COLOR,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              }}
            />
            <span className="text-sm text-ink-secondary">Semantic Drift</span>
          </div>

          {/* Relationship edge types */}
          <h4 className="text-xs uppercase tracking-wider text-ink-tertiary mt-4">
            Cross-Branch Relations
          </h4>
          <p className="text-xs text-ink-tertiary mb-2">
            Visible on hover
          </p>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-0.5"
              style={{ backgroundColor: CONVERGENCE_COLOR, opacity: 0.6 }}
            />
            <span className="text-sm text-ink-secondary">Agreement</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-0.5"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, ${MARCUS_COLOR} 0, ${MARCUS_COLOR} 4px, transparent 4px, transparent 6px)`,
                opacity: 0.6
              }}
            />
            <span className="text-sm text-ink-secondary">Tension</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-0.5"
              style={{ backgroundColor: MARCUS_COLOR, opacity: 0.6 }}
            />
            <span className="text-sm text-ink-secondary">Contradiction</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-0.5"
              style={{ backgroundColor: INSIGHT_COLOR, opacity: 0.7 }}
            />
            <span className="text-sm text-ink-secondary">Paradox</span>
          </div>
        </div>

        {/* Keyboard shortcuts */}
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-xs uppercase tracking-wider text-ink-tertiary mb-2">Controls</h4>
          <div className="space-y-1 text-xs text-ink-tertiary">
            <div className="flex justify-between">
              <span>Zoom in/out</span>
              <span className="font-mono">+/-</span>
            </div>
            <div className="flex justify-between">
              <span>Reset view</span>
              <span className="font-mono">0</span>
            </div>
            <div className="flex justify-between">
              <span>Deselect</span>
              <span className="font-mono">Esc</span>
            </div>
            <div className="flex justify-between">
              <span>Pan</span>
              <span>Drag</span>
            </div>
            <div className="flex justify-between">
              <span>Zoom</span>
              <span>Scroll/Pinch</span>
            </div>
          </div>
          {transform.k !== 1 && (
            <div className="mt-2 text-xs text-ink-tertiary">
              Zoom: {Math.round(transform.k * 100)}%
            </div>
          )}
        </div>

        {data && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-ink-tertiary">
              {data.metadata.total_nodes} nodes &middot; {data.metadata.total_edges} connections
            </p>
          </div>
        )}
      </div>
    )
  }, [selectedNode, data, transform.k])

  return (
    <LensLayout
      title="Epistemological Tree"
      subtitle="Map claims to their philosophical roots"
      loading={loading}
      error={error}
      sidebar={sidebar}
    >
      {data && (
        <div className="card overflow-hidden">
          {/* SVG visualization area */}
          <svg
            ref={svgRef}
            className="w-full bg-field-subtle"
            style={{ height: `${SVG_HEIGHT}px` }}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* SVG Definitions for gradients and effects */}
            <defs>
              {/* Radial gradient for Marcus selection highlight */}
              <radialGradient id="selection-marcus" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={MARCUS_COLOR} stopOpacity="0.15" />
                <stop offset="70%" stopColor={MARCUS_COLOR} stopOpacity="0.05" />
                <stop offset="100%" stopColor={MARCUS_COLOR} stopOpacity="0" />
              </radialGradient>
              {/* Radial gradient for Demartini selection highlight */}
              <radialGradient id="selection-demartini" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={DEMARTINI_COLOR} stopOpacity="0.15" />
                <stop offset="70%" stopColor={DEMARTINI_COLOR} stopOpacity="0.05" />
                <stop offset="100%" stopColor={DEMARTINI_COLOR} stopOpacity="0" />
              </radialGradient>
              {/* Radial gradient for Convergence/Synthesis selection highlight */}
              <radialGradient id="selection-convergence" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={CONVERGENCE_COLOR} stopOpacity="0.15" />
                <stop offset="70%" stopColor={CONVERGENCE_COLOR} stopOpacity="0.05" />
                <stop offset="100%" stopColor={CONVERGENCE_COLOR} stopOpacity="0" />
              </radialGradient>
              {/* Radial gradient for Insight/Root selection highlight */}
              <radialGradient id="selection-insight" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={INSIGHT_COLOR} stopOpacity="0.15" />
                <stop offset="70%" stopColor={INSIGHT_COLOR} stopOpacity="0.05" />
                <stop offset="100%" stopColor={INSIGHT_COLOR} stopOpacity="0" />
              </radialGradient>
              {/* Radial gradient for neutral selection highlight */}
              <radialGradient id="selection-neutral" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={NEUTRAL_COLOR} stopOpacity="0.15" />
                <stop offset="70%" stopColor={NEUTRAL_COLOR} stopOpacity="0.05" />
                <stop offset="100%" stopColor={NEUTRAL_COLOR} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Main group with zoom/pan transform and margin offset */}
            <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
              <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
              {/* Render branch connections with organic bezier curves */}
              <g className="branches">
                {nodePositions
                  .filter(node => node.parent)
                  .map(node => {
                    // Check if this branch is in the hover lineage
                    const inLineage = isInLineage(node.data.id) && isInLineage(node.parent!.data.id)
                    const dimmed = hoveredNode && !inLineage

                    return (
                      <path
                        key={`branch-${node.data.id}`}
                        d={createBranchPath(
                          { x: node.parent!.x, y: node.parent!.y },
                          { x: node.x, y: node.y }
                        )}
                        fill="none"
                        stroke={inLineage ? getNodeColor(node.data) : BORDER_COLOR}
                        strokeWidth={inLineage ? 2 : 1}
                        strokeOpacity={dimmed ? 0.2 : inLineage ? 0.8 : 0.5}
                        className="transition-all duration-200"
                      />
                    )
                  })}
              </g>

              {/* Render cross-branch relationship edges (hidden by default, visible on hover) */}
              <g className="relationship-edges">
                {relationshipEdges.map(edge => {
                  const source = nodePositionMap.get(edge.source)
                  const target = nodePositionMap.get(edge.target)
                  if (!source || target === undefined) return null
                  if (!target) return null

                  // Check if edge should be visible (either end is hovered or selected)
                  const isVisible = hoveredNode === edge.source ||
                                    hoveredNode === edge.target ||
                                    (selectedNode?.type === 'node' &&
                                     ((selectedNode.data as TreeNode).id === edge.source ||
                                      (selectedNode.data as TreeNode).id === edge.target))

                  return (
                    <path
                      key={edge.id}
                      d={createBranchPath(source, target)}
                      fill="none"
                      stroke={getRelationshipEdgeColor(edge.type)}
                      strokeWidth={1}
                      strokeOpacity={isVisible ? getRelationshipEdgeOpacity(edge.type) : 0}
                      strokeDasharray={edge.type === 'tension' ? '4,2' : undefined}
                      className="transition-opacity duration-300 pointer-events-none"
                    />
                  )
                })}
              </g>

              {/* Render selection highlights behind nodes */}
              <g className="selection-highlights">
                {nodePositions.map(node => {
                  const isSelected = selectedNode?.type === 'node' &&
                                     (selectedNode.data as TreeNode).id === node.data.id
                  if (!isSelected) return null

                  // Get appropriate gradient based on node type/speaker
                  let gradientId = 'selection-neutral'
                  if (node.data.type === 'root') gradientId = 'selection-insight'
                  else if (node.data.type === 'synthesis' || node.data.speaker === 'shared') gradientId = 'selection-convergence'
                  else if (node.data.speaker === 'marcus') gradientId = 'selection-marcus'
                  else if (node.data.speaker === 'demartini') gradientId = 'selection-demartini'

                  return (
                    <circle
                      key={`selection-${node.data.id}`}
                      cx={node.x}
                      cy={node.y}
                      r={24}
                      fill={`url(#${gradientId})`}
                      className="pointer-events-none"
                    />
                  )
                })}
              </g>

              {/* Render nodes with enhanced styling */}
              <g className="nodes">
                {nodePositions.map(node => {
                  const fillColor = getNodeColor(node.data)
                  const radius = getNodeRadius(node.data)
                  const isHovered = hoveredNode === node.data.id
                  const inLineage = isInLineage(node.data.id)
                  const dimmed = hoveredNode && !inLineage
                  const isSelected = selectedNode?.type === 'node' &&
                                     (selectedNode.data as TreeNode).id === node.data.id

                  // Calculate opacity based on interaction state
                  let opacity = 0.8 // base opacity per design doc
                  if (isHovered || isSelected) opacity = 1
                  else if (inLineage) opacity = 0.9
                  else if (dimmed) opacity = 0.3

                  return (
                    <g
                      key={node.data.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer"
                      onClick={() => setSelectedNode({ type: 'node', data: node.data })}
                      onMouseEnter={() => handleNodeHover(node.data.id)}
                      onMouseLeave={() => handleNodeHover(null)}
                    >
                      {/* Node circle - soft fill, no stroke per design doc */}
                      <circle
                        r={radius}
                        fill={fillColor}
                        opacity={opacity}
                        className="transition-opacity duration-200"
                      />

                      {/* Labels for root, category, and synthesis nodes */}
                      {shouldShowLabel(node.data) && (
                        <text
                          y={-(radius + 6)}
                          textAnchor="middle"
                          className="pointer-events-none select-none"
                          style={{
                            fontSize: node.data.type === 'root' ? '12px' :
                                     node.data.type === 'category' ? '10px' : '9px',
                            fill: dimmed ? '#A0A0A0' : '#64748B',
                            fontWeight: node.data.type === 'root' ? 600 : 500,
                            opacity: dimmed ? 0.5 : 1,
                            transition: 'opacity 200ms, fill 200ms'
                          }}
                        >
                          {node.data.label}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
              </g>
            </g>
          </svg>
        </div>
      )}
    </LensLayout>
  )
}
