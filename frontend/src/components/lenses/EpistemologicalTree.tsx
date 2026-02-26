'use client'

import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import type { HierarchyPointNode } from 'd3'
import { useTree, useClaims, useWikiIndex } from '@/lib/useData'
import { LensLayout, DetailPanel, SpeakerBadge, ClaimTypeBadge } from './LensLayout'
import { TimecodeLink } from '@/components/ui/TimecodeLink'
import type { TreeNode, SynthesisNode, SemanticDrift, Claim, TreeEdge } from '@/lib/types'

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

// Trunk/branch colors for organic feel
const TRUNK_COLOR = '#8B7355' // Warm brown for main trunk
const BRANCH_COLOR = '#A0896C' // Lighter brown for branches

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
 * Get the node radius based on type - INCREASED for visibility
 * Root and category nodes are larger for visual hierarchy
 */
const getNodeRadius = (node: TreeNode): number => {
  switch (node.type) {
    case 'root': return 24      // Large root at the base
    case 'category': return 16  // Medium category nodes
    case 'synthesis': return 12 // Synthesis nodes
    case 'branch': return 12    // Branch nodes
    case 'claim': return 8      // Claim "leaves" at top
    default: return 8
  }
}

/**
 * Get stroke width for branches based on depth
 * Trunk is thick, progressively thinner toward leaves
 */
const getBranchStrokeWidth = (depth: number): number => {
  switch (depth) {
    case 0: return 6  // Root trunk
    case 1: return 4  // Main branches
    case 2: return 3  // Secondary branches
    case 3: return 2  // Tertiary branches
    default: return 1.5 // Leaf connections
  }
}

/**
 * Get the label for a node to display
 */
const getNodeLabel = (node: TreeNode): string => {
  if (node.type === 'root') return 'Epistemological Roots'
  if (node.type === 'claim' && node.id) {
    // Extract claim ID like "D01" from the node ID
    const match = node.id.match(/[DM]\d+/)
    return match ? match[0] : node.label.slice(0, 12)
  }
  return node.label
}

/**
 * Get label positioning based on node type
 */
const getLabelPosition = (node: TreeNode): { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' } => {
  switch (node.type) {
    case 'root':
      return { dx: 0, dy: 35, anchor: 'middle' } // Below root
    case 'category':
      return { dx: 0, dy: -22, anchor: 'middle' } // Above category
    case 'branch':
      return { dx: 18, dy: 4, anchor: 'start' } // To the right
    case 'claim':
      return { dx: 0, dy: -14, anchor: 'middle' } // Above claim
    default:
      return { dx: 0, dy: -14, anchor: 'middle' }
  }
}

/**
 * Get font size for labels based on node type
 */
const getLabelFontSize = (node: TreeNode): number => {
  switch (node.type) {
    case 'root': return 14
    case 'category': return 12
    case 'branch': return 10
    case 'claim': return 9
    default: return 9
  }
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
 * Create an organic tree branch path between parent and child nodes
 * Uses cubic bezier curves that bow outward then up, like real tree branches
 * The curve goes: from parent, bows outward horizontally, then sweeps up to child
 */
const createOrganicBranchPath = (
  parent: { x: number; y: number },
  child: { x: number; y: number },
  depth: number
): string => {
  // Calculate horizontal distance
  const dx = child.x - parent.x
  const dy = child.y - parent.y

  // For bottom-up tree: parent is below, child is above (lower y value)
  // Control points create an organic curve that bows outward then up

  // First control point: extend horizontally from parent with slight upward curve
  // The further out the child, the more the branch bows
  const bowFactor = Math.min(Math.abs(dx) * 0.3, 40) // How much the branch bows
  const verticalFactor = Math.abs(dy) * 0.4

  // Control point 1: horizontal extension from parent
  const cp1x = parent.x + dx * 0.2
  const cp1y = parent.y + dy * 0.1 + (dx > 0 ? -bowFactor * 0.3 : bowFactor * 0.3)

  // Control point 2: sweeps toward child
  const cp2x = child.x - dx * 0.1
  const cp2y = parent.y + dy * 0.6

  return `M ${parent.x} ${parent.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${child.x} ${child.y}`
}

/**
 * Create smooth bezier curves for relationship edges that arc to avoid overlaps
 * Uses asymmetric control points to create natural-looking curves
 */
const createRelationshipPath = (
  source: { x: number; y: number },
  target: { x: number; y: number }
): string => {
  const dx = target.x - source.x
  const dy = target.y - source.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Arc the curve outward based on horizontal distance
  // Longer horizontal distances get more pronounced arcs
  const arcAmount = Math.min(Math.abs(dx) * 0.4, 100)

  // Determine curve direction based on relative positions
  // Curves bow upward/downward to avoid crossing through the tree
  const curveDirection = dx > 0 ? 1 : -1

  // First control point: arc outward from source
  const cp1x = source.x + dx * 0.25
  const cp1y = source.y + dy * 0.2 - arcAmount * curveDirection

  // Second control point: arc toward target
  const cp2x = target.x - dx * 0.25
  const cp2y = target.y - dy * 0.2 - arcAmount * curveDirection

  return `M ${source.x} ${source.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${target.x} ${target.y}`
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
 * Get base opacity for relationship edge based on type
 * These are the "always visible" opacities - increased for better visibility
 */
const getRelationshipEdgeOpacity = (type: string): number => {
  switch (type) {
    case 'agreement': return 0.7
    case 'tension': return 0.6
    case 'contradiction': return 0.8
    case 'paradox': return 0.7
    default: return 0.5
  }
}

/**
 * Get stroke width for relationship edge based on type
 */
const getRelationshipEdgeStrokeWidth = (type: string): number => {
  switch (type) {
    case 'contradiction': return 2
    default: return 1.5
  }
}

/**
 * Get stroke dash array for relationship edge based on type
 */
const getRelationshipEdgeDashArray = (type: string): string | undefined => {
  switch (type) {
    case 'tension': return '4,2'
    case 'paradox': return '2,2'
    default: return undefined
  }
}

// Node type for selection
type SelectedNode = {
  type: 'node' | 'synthesis' | 'drift'
  data: TreeNode | SynthesisNode | SemanticDrift
}

// Layout constants - MASSIVELY EXPANDED for organic tree with spreading claims
const SVG_WIDTH = 2400
const SVG_HEIGHT = 1000
const MARGIN = { top: 80, right: 120, bottom: 100, left: 120 }

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
  const { data: claimsData } = useClaims()
  const { data: wikiData } = useWikiIndex()
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [hoveredLineage, setHoveredLineage] = useState<Set<string>>(new Set())
  const svgRef = useRef<SVGSVGElement>(null)
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  // Zoom and pan transform state
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })

  // Create a lookup map for claims by ID
  const claimsMap = useMemo(() => {
    if (!claimsData) return new Map<string, Claim>()
    return new Map(claimsData.claims.map(c => [c.id, c]))
  }, [claimsData])

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
  // FLIPPED: Root at bottom, claims at top (like a real tree)
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
        // Massive separation for claims to fan out like leaves
        // Claims should be very spread out to show cross-branch relationships
        const aClaim = a.data.type === 'claim'
        const bClaim = b.data.type === 'claim'

        if (aClaim && bClaim) {
          // Claims get maximum separation
          return a.parent === b.parent ? 1.8 : 3.5
        } else if (aClaim || bClaim) {
          // Mixed claim/non-claim
          return 1.5
        } else {
          // Non-claims (categories, branches)
          return a.parent === b.parent ? 1.2 : 2.0
        }
      })

    // Apply layout to hierarchy - this calculates x,y positions
    const root = treeLayout(hierarchy)

    // FLIP Y coordinates: D3 puts root at top (y=0), we want root at bottom
    // Invert all y values so root is at bottom of the tree
    const descendants = root.descendants()
    descendants.forEach(node => {
      // Flip y: map from [0, treeHeight] to [treeHeight, 0]
      node.y = treeHeight - node.y
    })

    // ORGANIC SPREADING: Add vertical jitter to claim nodes to fan them out like leaves
    // Group claims by their parent to create natural branch spreading
    const claimsByParent = new Map<string, typeof descendants>()
    descendants.forEach(node => {
      if (node.data.type === 'claim' && node.parent) {
        const parentId = node.parent.data.id
        if (!claimsByParent.has(parentId)) {
          claimsByParent.set(parentId, [])
        }
        claimsByParent.get(parentId)!.push(node)
      }
    })

    // For each parent's claims, stagger them vertically in a natural arc
    claimsByParent.forEach((claims, parentId) => {
      if (claims.length <= 1) return // No need to stagger single claims

      // Sort claims by x position to apply consistent vertical offsets
      claims.sort((a, b) => a.x - b.x)

      // Create an arc: claims in the middle go higher, edges stay lower
      // This creates a natural fan/canopy effect
      const spreadRange = 80 // Vertical range for the arc
      claims.forEach((claim, index) => {
        const ratio = claims.length > 1 ? index / (claims.length - 1) : 0.5
        // Parabolic curve: peaks in middle (ratio=0.5), lower at edges (ratio=0 or 1)
        const arcHeight = Math.sin(ratio * Math.PI) * spreadRange
        claim.y -= arcHeight // Subtract to move upward (remember y is flipped)
      })
    })

    // Store all positioned nodes (descendants includes root)
    setNodePositions(descendants)
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
    if (!svgRef.current || !data) return

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
  }, [data])

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
          {selectedNode.type === 'node' && (() => {
            const node = selectedNode.data as TreeNode

            // ROOT NODE - Show overview and categories
            if (node.type === 'root') {
              const categories = data?.nodes.filter(n => n.parent_id === node.id) || []
              const totalClaims = data?.nodes.filter(n => n.type === 'claim').length || 0

              return (
                <div className="space-y-4">
                  {node.description && (
                    <p className="text-sm text-ink-secondary leading-relaxed">
                      {node.description}
                    </p>
                  )}
                  {!node.description && (
                    <p className="text-sm text-ink-secondary">
                      The foundational assumptions and worldviews that underpin all claims in this debate.
                      Each branch traces how philosophical positions flow from deeper epistemological commitments.
                    </p>
                  )}

                  <div>
                    <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-2">
                      Statistics
                    </span>
                    <div className="text-sm text-ink-secondary space-y-1">
                      <div>{totalClaims} claims mapped</div>
                      <div>{categories.length} major categories</div>
                      <div>{relationshipEdges.length} cross-branch relationships</div>
                    </div>
                  </div>

                  {categories.length > 0 && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-2">
                        Categories
                      </span>
                      <div className="space-y-1">
                        {categories.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedNode({ type: 'node', data: cat })}
                            className="w-full text-left text-sm text-ink-secondary hover:text-ink hover:bg-field-subtle px-2 py-1 rounded transition-colors"
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            // CATEGORY NODE - Show branches and scope
            if (node.type === 'category') {
              const branches = data?.nodes.filter(n => n.parent_id === node.id) || []
              const claimsInCategory = data?.nodes.filter(n => {
                // Find all claims that are descendants of this category
                let current = data?.nodes.find(nd => nd.id === n.id)
                while (current && current.parent_id) {
                  if (current.parent_id === node.id) return true
                  current = data?.nodes.find(nd => nd.id === current?.parent_id)
                }
                return false
              }).filter(n => n.type === 'claim') || []

              return (
                <div className="space-y-4">
                  {node.description && (
                    <p className="text-sm text-ink-secondary leading-relaxed">
                      {node.description}
                    </p>
                  )}
                  {!node.description && (
                    <p className="text-sm text-ink-secondary">
                      {node.id === 'cat-ontology' && 'Claims about the nature of reality, existence, and what is fundamentally real.'}
                      {node.id === 'cat-epistemology' && 'Claims about how we know what we know, and the validity of different ways of knowing.'}
                      {node.id === 'cat-ethics' && 'Claims about right and wrong, moral obligations, and how to evaluate actions.'}
                      {node.id === 'cat-methodology' && 'Claims about human psychology, perception, and the therapeutic frame.'}
                    </p>
                  )}

                  <div className="text-sm text-ink-secondary">
                    <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-1">
                      Scope
                    </span>
                    {claimsInCategory.length} claims in this category
                  </div>

                  {branches.length > 0 && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-2">
                        Branches
                      </span>
                      <div className="space-y-1">
                        {branches.map(branch => (
                          <button
                            key={branch.id}
                            onClick={() => setSelectedNode({ type: 'node', data: branch })}
                            className="w-full text-left text-sm text-ink-secondary hover:text-ink hover:bg-field-subtle px-2 py-1 rounded transition-colors"
                          >
                            {branch.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            // BRANCH NODE - Show claims and tensions
            if (node.type === 'branch') {
              const claimsInBranch = data?.nodes.filter(n => n.parent_id === node.id && n.type === 'claim') || []
              const tensions = relationshipEdges.filter(e =>
                claimsInBranch.some(c => c.id === e.source || c.id === e.target)
              )

              return (
                <div className="space-y-4">
                  {node.speaker && (
                    <div className="flex items-center gap-2">
                      <SpeakerBadge speaker={node.speaker} />
                    </div>
                  )}

                  {node.description && (
                    <p className="text-sm text-ink-secondary leading-relaxed">
                      {node.description}
                    </p>
                  )}

                  <div className="text-sm text-ink-secondary">
                    <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-1">
                      Scope
                    </span>
                    {claimsInBranch.length} claims in this branch
                  </div>

                  {claimsInBranch.length > 0 && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-2">
                        Claims
                      </span>
                      <div className="space-y-1">
                        {claimsInBranch.map(claim => {
                          const claimId = claim.id.replace(/^claim-/, '')
                          const claimData = claimsMap.get(claimId)
                          return (
                            <button
                              key={claim.id}
                              onClick={() => setSelectedNode({ type: 'node', data: claim })}
                              className="w-full text-left text-sm text-ink-secondary hover:text-ink hover:bg-field-subtle px-2 py-1 rounded transition-colors"
                            >
                              <span className="font-mono text-xs">{claim.id}</span>
                              {claimData && <span className="ml-2">{claimData.text.slice(0, 40)}...</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {tensions.length > 0 && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-2">
                        Cross-Branch Relations
                      </span>
                      <div className="text-sm text-ink-secondary space-y-1">
                        {tensions.slice(0, 5).map(t => (
                          <div key={t.id} className="text-xs">
                            <span className="capitalize font-medium">{t.type}</span> with other claims
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            // CLAIM NODE - Show full claim details
            if (node.type === 'claim') {
              // Strip "claim-" prefix from tree.json IDs to match claims.json format (e.g., "claim-M14" -> "M14")
              const claimId = node.id.replace(/^claim-/, '')
              const claim = claimsMap.get(claimId)
              const claimRelationships = relationshipEdges.filter(e =>
                e.source === node.id || e.target === node.id
              )

              if (!claim) {
                return (
                  <div className="text-sm text-ink-secondary">
                    Claim data not found for {node.id}
                  </div>
                )
              }

              return (
                <div className="space-y-4">
                  {/* Claim header info */}
                  <div className="flex items-center gap-2">
                    <SpeakerBadge speaker={claim.speaker} />
                    <ClaimTypeBadge type={claim.type} />
                  </div>

                  {/* Claim text */}
                  <p className="text-sm text-ink leading-relaxed">
                    {claim.text}
                  </p>

                  {/* Timestamp */}
                  {claim.timestamp && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-1">
                        Timestamp
                      </span>
                      <TimecodeLink seconds={claim.timestamp} />
                    </div>
                  )}

                  {/* Warrants */}
                  {claim.warrants && claim.warrants.length > 0 && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-2">
                        Supporting Warrants
                      </span>
                      <div className="space-y-2">
                        {claim.warrants.map((warrant, i) => (
                          <div key={i} className="text-sm text-ink-secondary bg-field-subtle px-3 py-2 rounded">
                            {warrant}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence */}
                  {claim.evidence && claim.evidence.length > 0 && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-2">
                        Evidence Cited
                      </span>
                      <div className="space-y-2">
                        {claim.evidence.map((evidence, i) => (
                          <div key={i} className="text-sm text-ink-secondary bg-field-subtle px-3 py-2 rounded">
                            {evidence}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related concepts */}
                  {claim.related_concepts && claim.related_concepts.length > 0 && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-2">
                        Related Concepts
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {claim.related_concepts.map((concept) => (
                          <span
                            key={concept}
                            className="text-xs bg-field-deep px-2 py-1 rounded"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Relationships */}
                  {claimRelationships.length > 0 && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-2">
                        Relationships
                      </span>
                      <div className="space-y-1">
                        {claimRelationships.map(rel => {
                          const otherNodeId = rel.source === node.id ? rel.target : rel.source
                          const otherNode = data?.nodes.find(n => n.id === otherNodeId)
                          return (
                            <div key={rel.id} className="text-sm text-ink-secondary">
                              <span className="capitalize font-medium text-xs">{rel.type}</span>
                              {' with '}
                              <span className="font-mono text-xs">{otherNodeId}</span>
                              {otherNode && ` - ${otherNode.label.slice(0, 30)}...`}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            // SYNTHESIS NODE (if we have any)
            if (node.type === 'synthesis') {
              return (
                <div className="space-y-3">
                  <div className="text-sm text-ink-secondary">
                    <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-1">
                      Type
                    </span>
                    <span className="capitalize">{node.type}</span>
                  </div>
                  {node.speaker && (
                    <div className="flex items-center gap-2">
                      <SpeakerBadge speaker={node.speaker} />
                    </div>
                  )}
                </div>
              )
            }

            // Fallback for unknown node types
            return (
              <div className="space-y-3">
                <div className="text-sm text-ink-secondary">
                  <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-1">
                    Type
                  </span>
                  <span className="capitalize">{node.type}</span>
                </div>
                {node.speaker && (
                  <div className="text-sm text-ink-secondary">
                    <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-1">
                      Speaker
                    </span>
                    <span className="capitalize">{node.speaker}</span>
                  </div>
                )}
                <div className="text-sm text-ink-secondary">
                  <span className="text-xs uppercase tracking-wider text-ink-tertiary block mb-1">
                    Depth
                  </span>
                  Level {node.depth}
                </div>
              </div>
            )
          })()}
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
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-0.5"
              style={{ backgroundColor: CONVERGENCE_COLOR, opacity: 0.5 }}
            />
            <span className="text-sm text-ink-secondary">Agreement</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-0.5"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, ${MARCUS_COLOR} 0, ${MARCUS_COLOR} 4px, transparent 4px, transparent 6px)`,
                opacity: 0.4
              }}
            />
            <span className="text-sm text-ink-secondary">Tension</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-1"
              style={{ backgroundColor: MARCUS_COLOR, opacity: 0.6 }}
            />
            <span className="text-sm text-ink-secondary">Contradiction</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-0.5"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, ${INSIGHT_COLOR} 0, ${INSIGHT_COLOR} 2px, transparent 2px, transparent 4px)`,
                opacity: 0.6
              }}
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
  }, [selectedNode, data, transform.k, claimsMap, relationshipEdges])

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
              {/* Render branch connections with organic tree-like bezier curves */}
              <g className="branches">
                {nodePositions
                  .filter(node => node.parent)
                  .map(node => {
                    // Check if this branch is in the hover lineage
                    const inLineage = isInLineage(node.data.id) && isInLineage(node.parent!.data.id)
                    const dimmed = hoveredNode && !inLineage

                    // Get stroke width based on depth (thicker near root)
                    const strokeWidth = getBranchStrokeWidth(node.depth)

                    // Color branches by speaker for visual path tracing
                    let branchColor = TRUNK_COLOR
                    if (inLineage) {
                      branchColor = getNodeColor(node.data)
                    } else if (node.data.speaker === 'marcus') {
                      branchColor = MARCUS_COLOR
                    } else if (node.data.speaker === 'demartini') {
                      branchColor = DEMARTINI_COLOR
                    } else if (node.depth <= 1) {
                      branchColor = TRUNK_COLOR
                    } else {
                      branchColor = BRANCH_COLOR
                    }

                    return (
                      <path
                        key={`branch-${node.data.id}`}
                        d={createOrganicBranchPath(
                          { x: node.parent!.x, y: node.parent!.y },
                          { x: node.x, y: node.y },
                          node.depth
                        )}
                        fill="none"
                        stroke={branchColor}
                        strokeWidth={inLineage ? strokeWidth + 1 : strokeWidth}
                        strokeOpacity={dimmed ? 0.15 : inLineage ? 0.9 : 0.6}
                        strokeLinecap="round"
                        className="transition-all duration-200"
                      />
                    )
                  })}
              </g>

              {/* Render cross-branch relationship edges (always visible, enhanced on hover) */}
              <g className="relationship-edges">
                {relationshipEdges.map(edge => {
                  const source = nodePositionMap.get(edge.source)
                  const target = nodePositionMap.get(edge.target)
                  if (!source || target === undefined) return null
                  if (!target) return null

                  // Check if edge is related to hovered/selected node
                  const isRelated = hoveredNode === edge.source ||
                                    hoveredNode === edge.target ||
                                    (selectedNode?.type === 'node' &&
                                     ((selectedNode.data as TreeNode).id === edge.source ||
                                      (selectedNode.data as TreeNode).id === edge.target))

                  // Calculate opacity: base opacity, +0.2 if related, dimmed if another node is hovered
                  const baseOpacity = getRelationshipEdgeOpacity(edge.type)
                  let opacity = baseOpacity
                  if (isRelated) {
                    opacity = Math.min(baseOpacity + 0.2, 1)
                  } else if (hoveredNode) {
                    opacity = baseOpacity * 0.5 // dim non-related edges when something is hovered
                  }

                  return (
                    <path
                      key={edge.id}
                      d={createRelationshipPath(source, target)}
                      fill="none"
                      stroke={getRelationshipEdgeColor(edge.type)}
                      strokeWidth={getRelationshipEdgeStrokeWidth(edge.type)}
                      strokeOpacity={opacity}
                      strokeDasharray={getRelationshipEdgeDashArray(edge.type)}
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

              {/* Render nodes with enhanced styling - ALL nodes get visible labels */}
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
                  let opacity = 0.85 // base opacity
                  if (isHovered || isSelected) opacity = 1
                  else if (inLineage) opacity = 0.95
                  else if (dimmed) opacity = 0.35

                  // Get label text and positioning
                  const label = getNodeLabel(node.data)
                  const labelPos = getLabelPosition(node.data)
                  const fontSize = getLabelFontSize(node.data)

                  return (
                    <g
                      key={node.data.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer"
                      onClick={() => setSelectedNode({ type: 'node', data: node.data })}
                      onMouseEnter={() => handleNodeHover(node.data.id)}
                      onMouseLeave={() => handleNodeHover(null)}
                    >
                      {/* Selection ring for hovered/selected nodes */}
                      {(isHovered || isSelected) && (
                        <circle
                          r={radius + 4}
                          fill="none"
                          stroke={fillColor}
                          strokeWidth={2}
                          strokeOpacity={0.4}
                          className="pointer-events-none"
                        />
                      )}

                      {/* Node circle with subtle stroke for definition */}
                      <circle
                        r={radius}
                        fill={fillColor}
                        stroke={fillColor}
                        strokeWidth={1}
                        strokeOpacity={0.3}
                        opacity={opacity}
                        className="transition-all duration-200"
                      />

                      {/* Inner highlight for depth */}
                      <circle
                        r={radius * 0.6}
                        fill="white"
                        opacity={0.15}
                        className="pointer-events-none"
                      />

                      {/* Label - ALL nodes get labels now */}
                      <text
                        x={labelPos.dx}
                        y={labelPos.dy}
                        textAnchor={labelPos.anchor}
                        className="pointer-events-none select-none"
                        style={{
                          fontSize: `${fontSize}px`,
                          fill: dimmed ? '#A0A0A0' : (node.data.type === 'root' ? '#5D4E37' : '#475569'),
                          fontWeight: node.data.type === 'root' || node.data.type === 'category' ? 600 : 500,
                          opacity: dimmed ? 0.4 : 0.9,
                          transition: 'opacity 200ms, fill 200ms',
                          textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                        }}
                      >
                        {label}
                      </text>
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
