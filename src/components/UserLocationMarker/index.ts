import type { Map as LeafletMap } from 'leaflet'
import { L } from '@/lib/leaflet'

export function addUserLocationMarker(
  map: LeafletMap,
  lat: number,
  lng: number,
): L.Marker {
  const icon = L.divIcon({
    className: 'fm-user-marker',
    html: '<span aria-hidden="true"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })

  const marker = L.marker([lat, lng], {
    icon,
    title: 'La tua posizione',
    zIndexOffset: 1000,
  })

  marker.addTo(map)
  return marker
}
