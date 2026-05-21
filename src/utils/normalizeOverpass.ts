import type { OverpassElement } from '@/types/overpass'
import type { Fountain } from '@/types/fountain'

function isValidLatLng(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

function normalizeOsmStatus(tags: Record<string, string>): Fountain['status'] {
  const keys = Object.keys(tags)
  const isInactive = keys.some(
    (k) => k.startsWith('disused:') || k.startsWith('abandoned:'),
  )
  if (isInactive) return 'inactive'
  if (tags.disused === 'yes' || tags.abandoned === 'yes') return 'inactive'
  return 'active'
}

export function normalizeOverpassElement(el: OverpassElement): Fountain | null {
  if (el.type !== 'node') return null
  if (typeof el.lat !== 'number' || typeof el.lon !== 'number') return null
  if (!isValidLatLng(el.lat, el.lon)) return null

  const tags = el.tags ?? {}
  const street = tags['addr:street'] ?? ''
  const number = tags['addr:housenumber'] ?? ''
  const address = street ? (number ? `${street} ${number}` : street) : (tags.name ?? '')
  const city =
    tags['addr:city'] ?? tags['addr:town'] ?? tags['addr:municipality'] ?? ''

  return {
    id: `osm-${el.id}`,
    lat: el.lat,
    lng: el.lon,
    address,
    city,
    status: normalizeOsmStatus(tags),
    name: tags.name || undefined,
    operator: tags.operator || undefined,
    description: tags.description || tags.note || undefined,
    image: tags.image || undefined,
    wikimediaCommons: tags.wikimedia_commons || undefined,
  }
}
