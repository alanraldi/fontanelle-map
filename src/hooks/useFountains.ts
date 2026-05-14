import { useState, useEffect, useCallback } from 'react'
import type { Fountain } from '@/types/fountain'
import type { GeoJSONFeatureCollection } from '@/types/geojson'
import { normalizeFeature } from '@/utils/normalize'

const GEOJSON_FETCH_TIMEOUT_MS = 10_000

export type FountainsLoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface UseFountainsResult {
  fountains: Fountain[]
  loadingState: FountainsLoadingState
  error: string | null
  lastFetchedAt: Date | null
  refetch: () => void
}

export function useFountains(): UseFountainsResult {
  const [fountains, setFountains] = useState<Fountain[]>([])
  const [loadingState, setLoadingState] = useState<FountainsLoadingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null)
  const [fetchTrigger, setFetchTrigger] = useState(0)

  const refetch = useCallback(() => {
    setFetchTrigger((n) => n + 1)
  }, [])

  useEffect(() => {
    const url = import.meta.env.VITE_GEOJSON_URL
    if (!url) {
      setLoadingState('error')
      setError('Configurazione mancante: contatta il supporto')
      console.error('[useFountains] VITE_GEOJSON_URL non impostata. Controlla il file .env')
      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), GEOJSON_FETCH_TIMEOUT_MS)

    setLoadingState('loading')
    setError(null)

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        return res.json() as Promise<GeoJSONFeatureCollection>
      })
      .then((data) => {
        const normalized = data.features
          .map(normalizeFeature)
          .filter((f): f is Fountain => f !== null)
        setFountains(normalized)
        setLoadingState('success')
        setLastFetchedAt(new Date())
      })
      .catch((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err))
        if (error.name === 'AbortError') {
          setError('Timeout: richiesta scaduta. Riprova.')
        } else {
          setError(error.message || 'Impossibile caricare le fontanelle')
        }
        setLoadingState('error')
      })
      .finally(() => {
        clearTimeout(timeoutId)
      })

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [fetchTrigger])

  return { fountains, loadingState, error, lastFetchedAt, refetch }
}
