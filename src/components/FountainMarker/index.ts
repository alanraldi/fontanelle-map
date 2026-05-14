import type { Map as LeafletMap } from 'leaflet'
import type { Fountain } from '@/types/fountain'
import { L } from '@/lib/leaflet'

const STATUS_LABELS: Record<Fountain['status'], string> = {
  active: 'attiva',
  inactive: 'inattiva',
  unknown: 'stato sconosciuto',
}

export function createFountainMarkerIcon(status: Fountain['status']): L.DivIcon {
  return L.divIcon({
    className: `fm-marker fm-marker--${status}`,
    html: '<span aria-hidden="true"></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  })
}

export interface FountainMarkerOptions {
  map: LeafletMap
  fountain: Fountain
  clusterGroup: L.MarkerClusterGroup
  onSelect: (fountain: Fountain) => void
}

export function addFountainMarker({
  fountain,
  clusterGroup,
  onSelect,
}: FountainMarkerOptions): L.Marker {
  const icon = createFountainMarkerIcon(fountain.status)
  const label = STATUS_LABELS[fountain.status]
  const title = [fountain.address, fountain.city].filter(Boolean).join(', ') || 'Fontanella'

  const marker = L.marker([fountain.lat, fountain.lng], {
    icon,
    title: `${title} — ${label}`,
    alt: `${title} — ${label}`,
  })

  marker.on('click', () => onSelect(fountain))
  clusterGroup.addLayer(marker)

  return marker
}
