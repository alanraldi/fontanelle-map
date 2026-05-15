import { useEffect, useRef, lazy } from 'react'
import type { RefObject } from 'react'
import type { Map as LeafletMap, LatLngBounds } from 'leaflet'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { L } from '@/lib/leaflet'
import 'leaflet.markercluster'
import type { Fountain } from '@/types/fountain'
import type { FountainsLoadingState } from '@/hooks/useFountains'
import { addFountainMarker } from '@/components/FountainMarker'
import { addUserLocationMarker } from '@/components/UserLocationMarker'
import { useGeolocationContext } from '@/contexts/GeolocationContext'

const ITALY_CENTER: [number, number] = [41.9028, 12.4964]
const DEFAULT_ZOOM = 6
const MAX_CLUSTER_RADIUS = 40
const DISABLE_CLUSTERING_AT_ZOOM = 16

type LeafletWithCluster = typeof L & {
  markerClusterGroup: (opts: Record<string, unknown>) => L.MarkerClusterGroup
}

interface MarkersLayerProps {
  fountains: Fountain[]
  selectedFountain: Fountain | null
  onFountainSelect: (fountain: Fountain) => void
}

function MarkersLayer({ fountains, selectedFountain, onFountainSelect }: MarkersLayerProps) {
  const map = useMap()
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
  const { lat: userLat, lng: userLng } = useGeolocationContext()
  const userMarkerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    const clusterGroup = (L as LeafletWithCluster).markerClusterGroup({
      maxClusterRadius: MAX_CLUSTER_RADIUS,
      disableClusteringAtZoom: DISABLE_CLUSTERING_AT_ZOOM,
      showCoverageOnHover: false,
      animate: true,
    })

    clusterGroupRef.current = clusterGroup
    clusterGroup.addTo(map)

    fountains.forEach((fountain) => {
      addFountainMarker({
        map,
        fountain,
        clusterGroup,
        onSelect: onFountainSelect,
      })
    })

    return () => {
      clusterGroup.clearLayers()
      clusterGroup.remove()
    }
  }, [fountains, map, onFountainSelect])

  useEffect(() => {
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }

    if (userLat !== null && userLng !== null) {
      map.flyTo([userLat, userLng], 15, { animate: true, duration: 1.5 })
      userMarkerRef.current = addUserLocationMarker(map, userLat, userLng)
    }

    return () => {
      userMarkerRef.current?.remove()
    }
  }, [map, userLat, userLng])

  useEffect(() => {
    if (selectedFountain) {
      map.setView([selectedFountain.lat, selectedFountain.lng], Math.max(map.getZoom(), 16), {
        animate: true,
      })
    }
  }, [selectedFountain, map])

  return null
}

interface BoundsTrackerProps {
  onBoundsChange: (bounds: LatLngBounds, zoom: number) => void
}

function BoundsTracker({ onBoundsChange }: BoundsTrackerProps) {
  const map = useMap()

  useEffect(() => {
    const handler = () => onBoundsChange(map.getBounds(), map.getZoom())
    map.on('moveend', handler)
    map.on('zoomend', handler)
    handler()
    return () => {
      map.off('moveend', handler)
      map.off('zoomend', handler)
    }
  }, [map, onBoundsChange])

  return null
}

interface MapInstanceSetterProps {
  mapRef: RefObject<LeafletMap | null>
}

function MapInstanceSetter({ mapRef }: MapInstanceSetterProps) {
  const map = useMap()
  useEffect(() => {
    mapRef.current = map
  }, [map, mapRef])
  return null
}

interface MapViewProps {
  fountains: Fountain[]
  selectedFountain: Fountain | null
  onFountainSelect: (fountain: Fountain) => void
  loadingState: FountainsLoadingState
  error: string | null
  onRetry: () => void
  onBoundsChange: (bounds: LatLngBounds, zoom: number) => void
  mapRef: RefObject<LeafletMap | null>
}

export function MapView({
  fountains,
  selectedFountain,
  onFountainSelect,
  loadingState,
  error,
  onRetry,
  onBoundsChange,
  mapRef,
}: MapViewProps) {
  return (
    <div className="absolute inset-0 z-0">
      <div aria-hidden="true" className="absolute inset-0">
        <MapContainer
          center={ITALY_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
          <MarkersLayer
            fountains={fountains}
            selectedFountain={selectedFountain}
            onFountainSelect={onFountainSelect}
          />
          <BoundsTracker onBoundsChange={onBoundsChange} />
          <MapInstanceSetter mapRef={mapRef} />
        </MapContainer>
      </div>
    </div>
  )
}

export const LazyMapView = lazy(() => Promise.resolve({ default: MapView }))
