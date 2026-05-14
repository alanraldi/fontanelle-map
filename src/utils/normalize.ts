import type { GeoJSONFeature, GeoJSONFeatureProperties } from '@/types/geojson'
import type { Fountain } from '@/types/fountain'

function isValidLatLng(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

function coordHash(lat: number, lng: number): string {
  return `${lat.toFixed(6)}_${lng.toFixed(6)}`
}

function normalizeStatus(props: GeoJSONFeatureProperties): Fountain['status'] {
  const raw = String(
    props.stato_funzionamento ??
      props.stato ??
      props.status ??
      props.attivo ??
      '',
  )
    .toLowerCase()
    .trim()

  if (!raw) return 'unknown'

  const active = ['attivo', 'active', 'funzionante', '1', 'true', 'si', 'sì', 'yes']
  if (active.includes(raw)) return 'active'

  const inactive = ['inattivo', 'inactive', 'non funzionante', '0', 'false', 'no']
  if (inactive.includes(raw)) return 'inactive'

  return 'unknown'
}

function normalizeAddress(props: GeoJSONFeatureProperties): string {
  return String(
    props.address ?? props.indirizzo ?? props.via ?? props.name ?? '',
  )
}

function normalizeCity(props: GeoJSONFeatureProperties): string {
  return String(props.comune ?? props.city ?? '')
}

export function normalizeFeature(feature: GeoJSONFeature): Fountain | null {
  if (feature.geometry?.type !== 'Point') return null

  const coords = feature.geometry.coordinates
  if (!Array.isArray(coords) || coords.length < 2) return null

  const [lng, lat] = coords
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  if (!isValidLatLng(lat, lng)) return null

  const props = feature.properties
  const rawId = props.id ?? props.fid ?? props.objectid

  return {
    id: rawId != null ? String(rawId) : `fountain-${coordHash(lat, lng)}`,
    lat,
    lng,
    address: normalizeAddress(props),
    city: normalizeCity(props),
    status: normalizeStatus(props),
  }
}
