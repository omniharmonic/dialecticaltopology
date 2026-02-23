'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'

export interface ManifestData {
  title: string
  source: string
  total_duration: number
  total_chunks: number
  total_claims: number
  speakers: {
    marcus: { chunks: number; claims: number }
    demartini: { chunks: number; claims: number }
  }
}

export interface LandscapeData {
  points: Array<{
    id: number
    x: number
    y: number
    z: number
    speaker: 'marcus' | 'demartini'
    text: string
    time: number
  }>
  clusters: Array<{
    id: number
    label: string
    centroid: [number, number, number]
  }>
}

export function useDataLoader<T>(bundleName: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const response = await fetch(`/data/${bundleName}.json`)
        if (!response.ok) {
          throw new Error(`Failed to load ${bundleName}`)
        }
        const json = await response.json()
        setData(json)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [bundleName])

  return { data, loading, error }
}

// Pre-load manifest on app start
export function useManifest() {
  return useDataLoader<ManifestData>('manifest')
}
