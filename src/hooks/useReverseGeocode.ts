import { useState, useEffect } from 'react'

interface NominatimAddress {
  road?: string
  pedestrian?: string
  path?: string
  neighbourhood?: string
  suburb?: string
  borough?: string
  city_district?: string
  municipality?: string
  city?: string
  town?: string
  village?: string
  county?: string
}

interface NominatimReverseResult {
  display_name: string
  address: NominatimAddress
}

function buildShortAddress(a: NominatimAddress, displayName: string): string {
  const street =
    a.road || a.pedestrian || a.path || a.neighbourhood || a.suburb || a.borough || a.city_district
  const city = a.city || a.town || a.village || a.municipality || a.county

  if (street && city) return `${street}, ${city}`
  if (street) return street
  if (city) return city

  // fallback: prime due parti del display_name
  const parts = displayName.split(',')
  if (parts.length >= 2) return `${parts[0].trim()}, ${parts[1].trim()}`
  return parts[0]?.trim() ?? ''
}

export function useReverseGeocode(lat: number | null, lng: number | null): string | null {
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    if (lat === null || lng === null) {
      setAddress(null)
      return
    }

    const controller = new AbortController()

    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { signal: controller.signal, headers: { 'Accept-Language': 'it' } },
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<NominatimReverseResult>
      })
      .then((data) => {
        const short = buildShortAddress(data.address, data.display_name ?? '')
        if (short) setAddress(short)
      })
      .catch((_err) => {
        // se falha, usa as coordenadas como fallback
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      })

    return () => controller.abort()
  }, [lat, lng])

  return address
}
