import { useState, useEffect } from 'react'

export interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  boundingbox: [string, string, string, string] // [south, north, west, east]
}

export function useNominatim(query: string): { results: NominatimResult[]; loading: boolean } {
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      setLoading(false)
      return
    }

    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>

    timer = setTimeout(() => {
      setLoading(true)

      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '5',
        countrycodes: 'it',
      })

      fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        signal: controller.signal,
        headers: { 'Accept-Language': 'it' },
      })
        .then((res) => res.json() as Promise<NominatimResult[]>)
        .then((data) => {
          setResults(data)
          setLoading(false)
        })
        .catch((err: unknown) => {
          const error = err instanceof Error ? err : new Error(String(err))
          if (error.name !== 'AbortError') {
            setResults([])
            setLoading(false)
          }
        })
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  return { results, loading }
}
