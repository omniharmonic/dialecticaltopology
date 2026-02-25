'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
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
  const svgRef = useRef<SVGSVGElement>(null)

  // State for computed D3 positions
  const [nodePositions, setNodePositions] = useState<HierarchyPointNode<TreeNodeWithChildren>[]>([])

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

  // TODO: Tasks 15-17 will add additional visualization logic
  // - Task 15: Node rendering with speaker colors
  // - Task 16: Cross-branch relationship edges
  // - Task 17: Zoom and pan interactions

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
  }, [selectedNode, data])

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
            {/* Main group with margin offset */}
            <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
              {/* Render branch connections with organic bezier curves */}
              <g className="branches">
                {nodePositions
                  .filter(node => node.parent)
                  .map(node => (
                    <path
                      key={`branch-${node.data.id}`}
                      d={createBranchPath(
                        { x: node.parent!.x, y: node.parent!.y },
                        { x: node.x, y: node.y }
                      )}
                      fill="none"
                      stroke={BORDER_COLOR}
                      strokeWidth={1}
                      strokeOpacity={0.5}
                      className="transition-opacity duration-300"
                    />
                  ))}
              </g>

              {/* Render nodes - Task 15 will add proper styling */}
              <g className="nodes">
                {nodePositions.map(node => {
                  // Determine node color based on speaker
                  let fillColor = '#6B7280' // default gray
                  if (node.data.speaker === 'marcus') {
                    fillColor = MARCUS_COLOR
                  } else if (node.data.speaker === 'demartini') {
                    fillColor = DEMARTINI_COLOR
                  } else if (node.data.type === 'root') {
                    fillColor = INSIGHT_COLOR
                  } else if (node.data.type === 'category') {
                    fillColor = CONVERGENCE_COLOR
                  }

                  // Size based on node type
                  const radius = node.data.type === 'root' ? 12 :
                                 node.data.type === 'category' ? 8 :
                                 node.data.type === 'branch' ? 6 : 5

                  return (
                    <g
                      key={node.data.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer"
                      onClick={() => setSelectedNode({ type: 'node', data: node.data })}
                      onMouseEnter={() => setHoveredNode(node.data.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <circle
                        r={radius}
                        fill={fillColor}
                        stroke={hoveredNode === node.data.id ? '#fff' : 'none'}
                        strokeWidth={2}
                        opacity={hoveredNode && hoveredNode !== node.data.id ? 0.4 : 1}
                      />
                      {/* Labels for non-claim nodes */}
                      {(node.data.type === 'root' || node.data.type === 'category') && (
                        <text
                          y={node.data.type === 'root' ? -18 : -12}
                          textAnchor="middle"
                          className="text-xs fill-ink-secondary pointer-events-none"
                          style={{ fontSize: node.data.type === 'root' ? '12px' : '10px' }}
                        >
                          {node.data.label}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
            </g>
          </svg>
        </div>
      )}
    </LensLayout>
  )
}
