import { useEffect, useRef, lazy } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { L } from '@/lib/leaflet'
import 'leaflet.markercluster'
import type { Fountain } from '@/types/fountain'
import type { FountainsLoadingState } from '@/hooks/useFountains'
import { addFountainMarker } from '@/components/FountainMarker'
import { addUserLocationMarker } from '@/components/UserLocationMarker'
import { useGeolocationContext } from '@/contexts/GeolocationContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

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

    if (fountains.length > 0) {
      try {
        const bounds = clusterGroup.getBounds()
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
        }
      } catch {
        // getBounds may throw if empty
      }
    }

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

interface MapViewProps {
  fountains: Fountain[]
  selectedFountain: Fountain | null
  onFountainSelect: (fountain: Fountain) => void
  loadingState: FountainsLoadingState
  error: string | null
  onRetry: () => void
}

export function MapView({
  fountains,
  selectedFountain,
  onFountainSelect,
  loadingState,
  error,
  onRetry,
}: MapViewProps) {
  if (loadingState === 'loading') {
    return (
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-slate-500 text-sm">Caricamento fontanelle…</p>
        </div>
      </div>
    )
  }

  if (loadingState === 'error' && error) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-slate-50 p-6">
        <Alert variant="destructive" className="max-w-sm">
          <AlertDescription>
            <p className="font-medium mb-2">Errore nel caricamento</p>
            <p className="mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
              <RefreshCw size={14} />
              Riprova
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
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
      </MapContainer>
    </div>
  )
}

export const LazyMapView = lazy(() => Promise.resolve({ default: MapView }))
