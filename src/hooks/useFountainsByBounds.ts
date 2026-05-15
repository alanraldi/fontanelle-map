import { useState, useEffect, useCallback } from 'react'
import type { LatLngBounds } from 'leaflet'
import type { Fountain } from '@/types/fountain'
import type { OverpassResponse } from '@/types/overpass'
import type { UseFountainsResult, FountainsLoadingState } from '@/hooks/useFountains'
import { normalizeOverpassElement } from '@/utils/normalizeOverpass'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const MIN_ZOOM = 10
const FETCH_TIMEOUT_MS = 25_000

export function useFountainsByBounds(
  bounds: LatLngBounds | null,
  zoom: number,
): UseFountainsResult {
  const [fountains, setFountains] = useState<Fountain[]>([])
  const [loadingState, setLoadingState] = useState<FountainsLoadingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null)
  const [fetchTrigger, setFetchTrigger] = useState(0)

  const refetch = useCallback(() => {
    setFetchTrigger((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!bounds || zoom < MIN_ZOOM) {
      setLoadingState('idle')
      setFountains([])
      setError(null)
      return
    }

    const s = bounds.getSouth()
    const w = bounds.getWest()
    const n = bounds.getNorth()
    const e = bounds.getEast()

    const query =
      `[out:json][timeout:25];` +
      `(node["amenity"="drinking_water"](${s},${w},${n},${e});` +
      `node["man_made"="water_tap"](${s},${w},${n},${e}););` +
      `out body;`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    setLoadingState('loading')
    setError(null)

    fetch(OVERPASS_URL, {
      method: 'POST',
      body: query,
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        return res.json() as Promise<OverpassResponse>
      })
      .then((data) => {
        const normalized = data.elements
          .map(normalizeOverpassElement)
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
  }, [bounds, zoom, fetchTrigger])

  return { fountains, loadingState, error, lastFetchedAt, refetch }
}
