'use client'

import { useState, useEffect } from 'react'
import type {
  Manifest,
  LandscapeData,
  ClaimsData,
  FlowData,
  OntologyData,
  DialogueData,
} from './types'

const BASE_PATH = '/data'

// Cache for loaded data
const cache: Record<string, unknown> = {}

async function loadJSON<T>(filename: string): Promise<T> {
  if (cache[filename]) {
    return cache[filename] as T
  }

  const response = await fetch(`${BASE_PATH}/${filename}`)
  if (!response.ok) {
    throw new Error(`Failed to load ${filename}: ${response.statusText}`)
  }

  const data = await response.json()
  cache[filename] = data
  return data as T
}

export function useManifest() {
  const [data, setData] = useState<Manifest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadJSON<Manifest>('manifest.json')
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

export function useLandscape() {
  const [data, setData] = useState<LandscapeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadJSON<LandscapeData>('landscape.json')
      .then((rawData) => {
        // Transform data to ensure compatibility
        const transformed: LandscapeData = {
          ...rawData,
          metadata: {
            ...rawData.metadata,
            n_points: rawData.metadata.num_points || rawData.metadata.n_points || rawData.points.length,
            n_clusters: rawData.metadata.num_clusters || rawData.clusters?.length || 0,
          },
          points: rawData.points.map((p) => ({
            ...p,
            start_time: p.time || 0,
            end_time: p.time + (p.duration || 0),
            cluster: typeof p.cluster_id === 'string' ? parseInt(p.cluster_id.replace(/\D/g, '')) || 0 : 0,
          })),
          // Use speaker_centroids directly if available (v2 data has it)
          speaker_centroids: rawData.speaker_centroids || {
            marcus: [0, 0, 0] as [number, number, number],
            demartini: [0, 0, 0] as [number, number, number],
          },
        }
        setData(transformed)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

export function useClaims() {
  const [data, setData] = useState<ClaimsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadJSON<ClaimsData>('claims.json')
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

export function useFlow() {
  const [data, setData] = useState<FlowData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadJSON<FlowData>('flow.json')
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

export function useOntology() {
  const [data, setData] = useState<OntologyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadJSON<OntologyData>('ontology.json')
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

export function useDialogue() {
  const [data, setData] = useState<DialogueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadJSON<DialogueData>('dialogue.json')
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

// Helper to format time
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Helper to get speaker color
export function getSpeakerColor(speaker: string): string {
  switch (speaker) {
    case 'marcus':
      return '#f59e0b' // amber-500
    case 'demartini':
      return '#14b8a6' // teal-500
    case 'synthesis':
      return '#8b5cf6' // violet-500
    default:
      return '#6b7280' // gray-500
  }
}

// Helper to get speaker name
export function getSpeakerName(speaker: string): string {
  switch (speaker) {
    case 'marcus':
      return 'Aubrey Marcus'
    case 'demartini':
      return 'Dr. John Demartini'
    case 'marcus_steelmanned':
      return 'Marcus (Steel-Manned)'
    case 'demartini_steelmanned':
      return 'Demartini (Steel-Manned)'
    case 'synthesis':
      return 'Synthesis'
    default:
      return speaker
  }
}
