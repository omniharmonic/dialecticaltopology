'use client'

import { useState, useRef, useMemo } from 'react'
import { useTree } from '@/lib/useData'
import { LensLayout, DetailPanel } from './LensLayout'
import type { TreeNode, SynthesisNode, SemanticDrift } from '@/lib/types'

// Design token colors for SVG (matching CSS variables)
const MARCUS_COLOR = '#C45A3C'
const DEMARTINI_COLOR = '#2E6B8A'
const CONVERGENCE_COLOR = '#7B6FA0'
const INSIGHT_COLOR = '#D4A853'

// Node type for selection
type SelectedNode = {
  type: 'node' | 'synthesis' | 'drift'
  data: TreeNode | SynthesisNode | SemanticDrift
}

export function EpistemologicalTree() {
  const { data, loading, error } = useTree()
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // TODO: Tasks 13-17 will add visualization logic here
  // - Task 13: D3 tree layout calculation
  // - Task 14: Bezier curve branch rendering
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

  // Placeholder for hover state usage (will be used in Tasks 13-17)
  const _hoveredNode = hoveredNode
  const _setHoveredNode = setHoveredNode

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
          {/* SVG visualization area - D3 will render here */}
          <svg
            ref={svgRef}
            className="w-full bg-field-subtle"
            style={{ height: '600px' }}
          >
            {/* Tree visualization will be rendered here by D3 in later tasks */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              className="text-sm fill-ink-tertiary"
            >
              Tree visualization (Tasks 13-17)
            </text>
          </svg>
        </div>
      )}
    </LensLayout>
  )
}
