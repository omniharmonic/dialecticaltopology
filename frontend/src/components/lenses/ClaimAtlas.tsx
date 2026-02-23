'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClaims } from '@/lib/useData'
import { LensLayout, DetailPanel, SpeakerBadge, ClaimTypeBadge } from './LensLayout'
import type { Claim, ThematicCluster } from '@/lib/types'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Claim card component
function ClaimCard({
  claim,
  isSelected,
  onClick,
  responses,
}: {
  claim: Claim
  isSelected: boolean
  onClick: () => void
  responses: string[]
}) {
  const speakerColor = claim.speaker === 'marcus' ? 'border-marcus' : 'border-demartini'

  return (
    <motion.button
      onClick={onClick}
      layout
      className={`
        w-full text-left p-4 rounded-xl border-l-4 transition-all
        ${speakerColor}
        ${isSelected ? 'bg-white/10 ring-1 ring-white/20' : 'bg-void-200 hover:bg-void-100'}
      `}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold opacity-70">{claim.id}</span>
          <SpeakerBadge speaker={claim.speaker} />
          <ClaimTypeBadge type={claim.type} />
        </div>
        <span className="text-xs text-gray-500">{formatTime(claim.timestamp)}</span>
      </div>

      <p className="text-sm line-clamp-3">{claim.text}</p>

      {responses.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <span>⟳</span>
          <span>{responses.length} response(s): {responses.join(', ')}</span>
        </div>
      )}
    </motion.button>
  )
}

// Thematic cluster visualization
function ClusterView({
  cluster,
  claims,
  selectedClaim,
  onSelectClaim,
  engagementMap,
}: {
  cluster: ThematicCluster
  claims: Claim[]
  selectedClaim: Claim | null
  onSelectClaim: (claim: Claim) => void
  engagementMap: Map<string, string[]>
}) {
  const clusterClaims = claims.filter((c) => cluster.claims.includes(c.id))

  const tensionColors: Record<string, string> = {
    fundamental_disagreement: 'border-red-500/50',
    spectrum_positions: 'border-yellow-500/50',
    domain_confusion: 'border-orange-500/50',
    different_foundations: 'border-blue-500/50',
  }

  return (
    <div
      className={`glass-panel rounded-xl p-4 border-t-2 ${
        tensionColors[cluster.tension_type] || 'border-gray-500/50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold">{cluster.label}</h3>
        <span className="text-xs text-gray-500 capitalize">
          {cluster.tension_type.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="space-y-2">
        {clusterClaims.map((claim) => (
          <ClaimCard
            key={claim.id}
            claim={claim}
            isSelected={selectedClaim?.id === claim.id}
            onClick={() => onSelectClaim(claim)}
            responses={engagementMap.get(claim.id) || []}
          />
        ))}
      </div>
    </div>
  )
}

// Claim detail panel
function ClaimDetail({
  claim,
  responses,
  onClose,
  onSelectClaim,
  allClaims,
}: {
  claim: Claim
  responses: string[]
  onClose: () => void
  onSelectClaim: (claim: Claim) => void
  allClaims: Claim[]
}) {
  return (
    <DetailPanel title={`${claim.id}: ${claim.speaker === 'marcus' ? 'Marcus' : 'Demartini'}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <SpeakerBadge speaker={claim.speaker} />
          <ClaimTypeBadge type={claim.type} />
          <span className="text-xs text-gray-500">{formatTime(claim.timestamp)}</span>
        </div>

        <blockquote className="text-sm italic border-l-2 border-gray-600 pl-3">
          "{claim.text}"
        </blockquote>

        {claim.warrants.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Supporting Warrants
            </h4>
            <ul className="text-sm space-y-1">
              {claim.warrants.map((w, i) => (
                <li key={i} className="text-gray-300 flex items-start gap-2">
                  <span className="text-gray-500">•</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {claim.evidence.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Evidence Cited
            </h4>
            <ul className="text-sm space-y-1">
              {claim.evidence.map((e, i) => (
                <li key={i} className="text-gray-300 flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {claim.related_concepts.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Related Concepts
            </h4>
            <div className="flex flex-wrap gap-1">
              {claim.related_concepts.map((c) => (
                <span
                  key={c}
                  className="text-xs bg-void-100 px-2 py-0.5 rounded capitalize"
                >
                  {c.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {responses.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Responses to This Claim
            </h4>
            <div className="space-y-2">
              {responses.map((rid) => {
                const responseClaim = allClaims.find((c) => c.id === rid)
                if (!responseClaim) return null
                return (
                  <button
                    key={rid}
                    onClick={() => onSelectClaim(responseClaim)}
                    className="w-full text-left p-2 bg-void-100 rounded-lg hover:bg-void-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold">{rid}</span>
                      <SpeakerBadge speaker={responseClaim.speaker} />
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {responseClaim.text}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
            Engagement Level
          </h4>
          <span className="text-sm capitalize">
            {claim.engagement_level.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
    </DetailPanel>
  )
}

export function ClaimAtlas() {
  const { data, loading, error } = useClaims()
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [filter, setFilter] = useState<{
    speaker: string | null
    type: string | null
  }>({ speaker: null, type: null })
  const [viewMode, setViewMode] = useState<'clusters' | 'list'>('clusters')

  // Build engagement map (claim -> responses)
  const engagementMap = useMemo(() => {
    if (!data) return new Map<string, string[]>()
    const map = new Map<string, string[]>()
    for (const engagement of data.engagement_map) {
      map.set(
        engagement.claim_id,
        engagement.responses.map((r) => r.claim_id)
      )
    }
    return map
  }, [data])

  // Filter claims
  const filteredClaims = useMemo(() => {
    if (!data) return []
    return data.claims.filter((c) => {
      if (filter.speaker && c.speaker !== filter.speaker) return false
      if (filter.type && c.type !== filter.type) return false
      return true
    })
  }, [data, filter])

  const sidebar = useMemo(() => {
    if (selectedClaim) {
      return (
        <ClaimDetail
          claim={selectedClaim}
          responses={engagementMap.get(selectedClaim.id) || []}
          onClose={() => setSelectedClaim(null)}
          onSelectClaim={setSelectedClaim}
          allClaims={data?.claims || []}
        />
      )
    }

    return (
      <div className="glass-panel rounded-xl p-4 sticky top-24">
        <h3 className="font-display font-semibold mb-4">About This View</h3>
        <p className="text-sm text-gray-400 mb-4">
          The Claim Atlas maps every philosophical claim made in the debate. Claims
          are organized by thematic clusters and show how speakers engage with each
          other's arguments.
        </p>

        {data && (
          <div className="space-y-3">
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                Statistics
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-void-200 p-2 rounded">
                  <div className="text-lg font-bold text-marcus">
                    {data.claims.filter((c) => c.speaker === 'marcus').length}
                  </div>
                  <div className="text-xs text-gray-500">Marcus Claims</div>
                </div>
                <div className="bg-void-200 p-2 rounded">
                  <div className="text-lg font-bold text-demartini">
                    {data.claims.filter((c) => c.speaker === 'demartini').length}
                  </div>
                  <div className="text-xs text-gray-500">Demartini Claims</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                By Type
              </h4>
              <div className="space-y-1 text-sm">
                {['ontological', 'epistemological', 'ethical', 'methodological'].map((type) => (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize text-gray-400">{type}</span>
                    <span>{data.claims.filter((c) => c.type === type).length}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }, [selectedClaim, data, engagementMap])

  return (
    <LensLayout
      title="Claim Atlas"
      subtitle={`${data?.claims.length || 0} philosophical claims mapped and analyzed`}
      loading={loading}
      error={error}
      sidebar={sidebar}
    >
      {data && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('clusters')}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  viewMode === 'clusters'
                    ? 'bg-marcus/20 text-marcus'
                    : 'bg-void-200 text-gray-400'
                }`}
              >
                By Theme
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  viewMode === 'list'
                    ? 'bg-marcus/20 text-marcus'
                    : 'bg-void-200 text-gray-400'
                }`}
              >
                All Claims
              </button>
            </div>

            <div className="flex gap-1 ml-auto">
              <select
                value={filter.speaker || ''}
                onChange={(e) =>
                  setFilter({ ...filter, speaker: e.target.value || null })
                }
                className="bg-void-200 text-sm rounded-lg px-3 py-1.5 border-0"
              >
                <option value="">All Speakers</option>
                <option value="marcus">Marcus</option>
                <option value="demartini">Demartini</option>
              </select>

              <select
                value={filter.type || ''}
                onChange={(e) =>
                  setFilter({ ...filter, type: e.target.value || null })
                }
                className="bg-void-200 text-sm rounded-lg px-3 py-1.5 border-0"
              >
                <option value="">All Types</option>
                <option value="ontological">Ontological</option>
                <option value="epistemological">Epistemological</option>
                <option value="ethical">Ethical</option>
                <option value="methodological">Methodological</option>
              </select>
            </div>
          </div>

          {/* Cluster view */}
          {viewMode === 'clusters' && (
            <div className="space-y-6">
              {data.thematic_clusters.map((cluster) => (
                <ClusterView
                  key={cluster.id}
                  cluster={cluster}
                  claims={filteredClaims}
                  selectedClaim={selectedClaim}
                  onSelectClaim={setSelectedClaim}
                  engagementMap={engagementMap}
                />
              ))}
            </div>
          )}

          {/* List view */}
          {viewMode === 'list' && (
            <div className="space-y-2">
              {filteredClaims.map((claim) => (
                <ClaimCard
                  key={claim.id}
                  claim={claim}
                  isSelected={selectedClaim?.id === claim.id}
                  onClick={() =>
                    setSelectedClaim(selectedClaim?.id === claim.id ? null : claim)
                  }
                  responses={engagementMap.get(claim.id) || []}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </LensLayout>
  )
}
