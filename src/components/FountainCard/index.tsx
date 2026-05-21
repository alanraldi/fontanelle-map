import { MapPin, Navigation, X } from 'lucide-react'
import type { Fountain } from '@/types/fountain'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistance } from '@/utils/distance'
import { useReverseGeocode } from '@/hooks/useReverseGeocode'
import { useGeolocationContext } from '@/contexts/GeolocationContext'
import { useFountainImage } from '@/hooks/useFountainImage'

const STATUS_LABELS: Record<Fountain['status'], string> = {
  active: 'Attiva',
  inactive: 'Inattiva',
  unknown: 'Sconosciuta',
}

const STATUS_VARIANTS: Record<Fountain['status'], 'active' | 'inactive' | 'unknown'> = {
  active: 'active',
  inactive: 'inactive',
  unknown: 'unknown',
}

interface FountainCardProps {
  fountain: Fountain
  onClose: () => void
}

export function FountainCard({ fountain, onClose }: FountainCardProps) {
  const { address, city, status, distance, name, operator, description, lat, lng } = fountain
  const { imageUrl, loading: imageLoading, isWikimedia } = useFountainImage(fountain)
  const hasOsmAddress = Boolean(address || city)
  const geocodedAddress = useReverseGeocode(hasOsmAddress ? null : lat, hasOsmAddress ? null : lng)
  const { lat: userLat, lng: userLng } = useGeolocationContext()

  const mapsUrl = (() => {
    const dest = `${lat},${lng}`
    const base = 'https://www.google.com/maps/dir/?api=1'
    const origin = userLat !== null && userLng !== null ? `&origin=${userLat},${userLng}` : ''
    return `${base}${origin}&destination=${dest}&travelmode=walking`
  })()

  const title = name || address || 'Fontanella'
  const displayAddress = address || (!name && geocodedAddress) || geocodedAddress
  const ariaLabel = [title, city || geocodedAddress].filter(Boolean).join(', ')

  return (
    <article
      aria-label={`Dettagli: ${ariaLabel}`}
      className="px-4 pt-2 pb-4"
    >
      {(imageUrl || imageLoading) && (
        <div className="-mx-4 -mt-2 mb-3">
          {imageLoading ? (
            <div className="w-full h-40 bg-slate-100 animate-pulse" />
          ) : (
            <div className="relative">
              <img
                src={imageUrl!}
                alt={title}
                className="w-full h-40 object-cover"
                loading="lazy"
              />
              {isWikimedia && (
                <span className="absolute bottom-1 right-2 text-[10px] text-white/70 drop-shadow-sm">
                  © Wikimedia Commons
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-sky-500 shrink-0" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-900 truncate">{title}</h2>
          </div>
          {displayAddress && displayAddress !== title && (
            <p className="text-sm text-slate-500 ml-6">{displayAddress}</p>
          )}
          {city && (
            <p className="text-sm text-slate-500 ml-6">{city}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Chiudi dettagli"
          className="shrink-0 -mr-2 -mt-1"
        >
          <X size={18} />
        </Button>
      </div>

      <div className="flex items-center gap-3 mt-3 ml-6">
        <Badge variant={STATUS_VARIANTS[status]}>
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{
              backgroundColor:
                status === 'active' ? '#16a34a' : status === 'inactive' ? '#dc2626' : '#94a3b8',
            }}
            aria-hidden="true"
          />
          {STATUS_LABELS[status]}
        </Badge>

        {distance !== undefined && (
          <span className="flex items-center gap-1 text-sm text-slate-500">
            <Navigation size={13} aria-hidden="true" />
            {formatDistance(distance)}
          </span>
        )}
      </div>

      {(operator || description) && (
        <div className="mt-3 ml-6 space-y-1">
          {operator && (
            <p className="text-xs text-slate-500">
              <span className="font-medium">Gestore:</span> {operator}
            </p>
          )}
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
      )}

      <div className="mt-3 ml-6 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors"
          aria-label="Apri indicazioni in Google Maps"
        >
          <Navigation size={12} aria-hidden="true" />
          Indicazioni
        </a>
      </div>
    </article>
  )
}
