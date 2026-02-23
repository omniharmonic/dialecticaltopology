import { create } from 'zustand'

export type Lens = 'landscape' | 'claims' | 'flow' | 'worldviews' | 'arena'

export interface Chunk {
  id: number
  speaker: 'marcus' | 'demartini' | 'unknown'
  text: string
  start_time: number
  end_time: number
  time_label: string
  token_estimate: number
}

export interface Claim {
  id: string
  text: string
  speaker: 'marcus' | 'demartini'
  type: 'ontological' | 'epistemological' | 'ethical' | 'methodological'
  warrants: string[]
  engagement_level: 'direct_counter' | 'partial' | 'deflection' | 'ignored'
  timestamp: number
}

interface AppState {
  // Navigation
  currentLens: Lens
  setLens: (lens: Lens) => void

  // Timeline
  currentTime: number
  setCurrentTime: (time: number) => void
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void

  // Selection
  selectedChunkId: number | null
  setSelectedChunk: (id: number | null) => void
  selectedClaimId: string | null
  setSelectedClaim: (id: string | null) => void

  // Wiki panel
  wikiPanelOpen: boolean
  wikiTerm: string | null
  openWiki: (term: string) => void
  closeWiki: () => void

  // Data loading
  dataLoaded: boolean
  setDataLoaded: (loaded: boolean) => void

  // Performance
  lowPerformanceMode: boolean
  setLowPerformanceMode: (low: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentLens: 'landscape',
  setLens: (lens) => set({ currentLens: lens }),

  // Timeline
  currentTime: 0,
  setCurrentTime: (time) => set({ currentTime: time }),
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),

  // Selection
  selectedChunkId: null,
  setSelectedChunk: (id) => set({ selectedChunkId: id }),
  selectedClaimId: null,
  setSelectedClaim: (id) => set({ selectedClaimId: id }),

  // Wiki panel
  wikiPanelOpen: false,
  wikiTerm: null,
  openWiki: (term) => set({ wikiPanelOpen: true, wikiTerm: term }),
  closeWiki: () => set({ wikiPanelOpen: false, wikiTerm: null }),

  // Data loading
  dataLoaded: false,
  setDataLoaded: (loaded) => set({ dataLoaded: loaded }),

  // Performance
  lowPerformanceMode: false,
  setLowPerformanceMode: (low) => set({ lowPerformanceMode: low }),
}))
