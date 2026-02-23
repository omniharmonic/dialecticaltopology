// Data types for Dialectical Topology

// Landscape data (v2 - claim-based clustering)
export interface LandscapePoint {
  id: number
  x: number
  y: number
  z: number
  speaker: 'marcus' | 'demartini' | 'unknown'
  speakers?: string[]
  text: string
  full_text?: string
  time: number
  time_label?: string
  time_range?: string
  duration?: number
  tokens?: number
  // Claim-based clustering
  cluster_id?: string
  cluster_similarity?: number
  related_claims?: { claim_id: string; similarity: number }[]
  // Computed fields for compatibility
  start_time: number
  end_time: number
  cluster: number
}

export interface LandscapeCluster {
  id: string | number
  centroid: [number, number, number]
  label: string
  full_claim?: string
  speaker?: string
  claim_type?: string
  chunk_ids?: number[]
  chunk_count?: number
  avg_similarity?: number
  related_concepts?: string[]
  // Legacy fields
  count?: number
  size?: number
  dominant_speaker?: string
}

export interface ClaimLandmark {
  id: string
  x: number
  y: number
  z: number
  speaker: string
  text: string
  type: string
  chunk_count: number
}

export interface LandscapeData {
  metadata: {
    version?: string
    num_points?: number
    n_points?: number
    num_clusters?: number
    n_clusters?: number
    num_claims?: number
    created_at?: string
    umap_params?: {
      n_neighbors: number
      min_dist: number
    }
    embedding_model?: string
    dimensions?: number
    chunking?: {
      min_tokens: number
      max_tokens: number
      allow_cross_speaker?: boolean
    }
    statistics?: {
      total_chunks: number
      avg_tokens: number
      avg_duration_seconds: number
    }
  }
  points: LandscapePoint[]
  clusters: LandscapeCluster[]
  claim_landmarks?: ClaimLandmark[]
  trajectories?: {
    marcus: number[][]
    demartini: number[][]
    raw_points: number[][]
  }
  speaker_centroids: {
    marcus: [number, number, number]
    demartini: [number, number, number]
  }
}

// Claims data
export interface Claim {
  id: string
  speaker: 'marcus' | 'demartini'
  text: string
  type: 'ontological' | 'epistemological' | 'ethical' | 'methodological'
  warrants: string[]
  evidence: string[]
  timestamp: number
  engagement_level: string
  related_concepts: string[]
}

export interface ClaimEngagement {
  claim_id: string
  responses: {
    claim_id: string
    type: string
    quality: string
  }[]
}

export interface ThematicCluster {
  id: string
  label: string
  claims: string[]
  tension_type: string
}

export interface ClaimsData {
  metadata: {
    source: string
    total_claims: number
  }
  claims: Claim[]
  engagement_map: ClaimEngagement[]
  thematic_clusters: ThematicCluster[]
}

// Flow data
export interface FlowPhase {
  id: string
  label: string
  start_time: number
  end_time: number
  summary: string
  dominant_speaker: string
  emotional_intensity: number
  key_claims: string[]
  mood: string
}

export interface InflectionPoint {
  id: string
  timestamp: number
  label: string
  description: string
  road_not_taken: string
  impact: string
}

export interface EmotionalArcPoint {
  time: number
  intensity: number
  note: string
}

export interface FlowData {
  metadata: {
    source: string
    total_duration_seconds: number
  }
  phases: FlowPhase[]
  inflection_points: InflectionPoint[]
  emotional_arc: {
    description: string
    trajectory: EmotionalArcPoint[]
  }
  speaker_dynamics: {
    demartini: {
      role: string
      strategy: string
      strengths: string[]
      vulnerabilities: string[]
    }
    marcus: {
      role: string
      strategy: string
      strengths: string[]
      vulnerabilities: string[]
    }
  }
}

// Ontology data
export interface OntologyDimension {
  id: string
  label: string
  question: string
  spectrum: {
    left: { label: string; description: string }
    right: { label: string; description: string }
  }
  positions: {
    demartini: {
      position: number
      summary: string
      key_claims: string[]
      warrants: string[]
    }
    marcus: {
      position: number
      summary: string
      key_claims: string[]
      warrants: string[]
    }
  }
  gap_analysis: {
    gap_type: string
    gap_size: number
    bridging_potential: string
    notes: string
  }
}

export interface OntologyData {
  metadata: {
    source: string
    methodology: string
  }
  dimensions: OntologyDimension[]
  synthesis: {
    core_tension: string
    domain_confusion: string
    bridging_insights: string[]
    irreconcilable_differences: string[]
  }
}

// Dialogue data
export interface DialogueSpeaker {
  name: string
  color: string
  core_position: string
}

export interface DialogueExchange {
  speaker: string
  content: string
  warrants?: string[]
  strength?: string
  insight?: string
}

export interface DialogueRound {
  id: number
  topic: string
  dimension: string
  exchanges: DialogueExchange[]
}

export interface DialogueData {
  metadata: {
    type: string
    page_title: string
    source: string
    description: string
  }
  speakers: {
    demartini_steelmanned: DialogueSpeaker
    marcus_steelmanned: DialogueSpeaker
    synthesis: DialogueSpeaker
  }
  rounds: DialogueRound[]
  gemini_integration: {
    description: string
    api_endpoint: string
    system_prompts: {
      demartini_voice: string
      marcus_voice: string
      synthesis_voice: string
    }
    prompt_template: string
    example_topics: string[]
    community_rounds: DialogueRound[]
  }
  final_synthesis: {
    title: string
    content: string
    convergence_points: string[]
    irreducible_tensions: string[]
  }
}

// Manifest
export interface Manifest {
  version: string
  source: {
    title: string
    subtitle: string
    duration_seconds: number
    speakers: {
      id: string
      name: string
      color: string
      role: string
    }[]
  }
  lenses: {
    id: string
    name: string
    description: string
    data_file: string
    component: string
  }[]
  statistics: {
    total_segments: number
    total_chunks: number
    total_claims: number
    total_wiki_entities: number
    dimensions_analyzed: number
    inflection_points: number
    arena_rounds: number
  }
}
