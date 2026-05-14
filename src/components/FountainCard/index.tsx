import { MapPin, Navigation, X } from 'lucide-react'
import type { Fountain } from '@/types/fountain'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistance } from '@/utils/distance'

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
  const { address, city, status, distance } = fountain
  const displayName = [address, city].filter(Boolean).join(', ') || 'Fontanella'

  return (
    <article
      aria-label={`Dettagli: ${displayName}`}
      className="px-4 pt-2 pb-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-sky-500 shrink-0" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-900 truncate">{address || 'Indirizzo non disponibile'}</h2>
          </div>
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
    </article>
  )
}
