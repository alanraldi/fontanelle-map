import { MapPin, Navigation, RefreshCw } from 'lucide-react'
import type { Fountain } from '@/types/fountain'
import type { FountainsLoadingState } from '@/hooks/useFountains'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistance } from '@/utils/distance'

const STATUS_COLORS: Record<Fountain['status'], string> = {
  active: '#16a34a',
  inactive: '#dc2626',
  unknown: '#94a3b8',
}

const STATUS_LABELS: Record<Fountain['status'], string> = {
  active: 'attiva',
  inactive: 'inattiva',
  unknown: 'stato sconosciuto',
}

interface FountainListItemProps {
  fountain: Fountain
  onSelect: (fountain: Fountain) => void
}

function FountainListItem({ fountain, onSelect }: FountainListItemProps) {
  const { address, city, status, distance } = fountain
  const displayName = address || 'Fontanella'
  const statusLabel = STATUS_LABELS[status]

  return (
    <li>
      <button
        onClick={() => onSelect(fountain)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 transition-colors"
        aria-label={`${displayName}${city ? `, ${city}` : ''} — ${statusLabel}${distance !== undefined ? `, ${formatDistance(distance)}` : ''}`}
      >
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: STATUS_COLORS[status] }}
          aria-hidden="true"
        />
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-slate-900 truncate">{displayName}</span>
          {city && (
            <span className="block text-xs text-slate-500 truncate">{city}</span>
          )}
        </span>
        {distance !== undefined && (
          <span className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
            <Navigation size={11} aria-hidden="true" />
            {formatDistance(distance)}
          </span>
        )}
        <MapPin size={14} className="text-slate-300 shrink-0" aria-hidden="true" />
      </button>
    </li>
  )
}

function LoadingSkeleton() {
  return (
    <ul aria-label="Caricamento fontanelle" className="divide-y divide-slate-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="px-4 py-3 flex items-center gap-3">
          <Skeleton className="w-3 h-3 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </li>
      ))}
    </ul>
  )
}

interface FountainListProps {
  fountains: Fountain[]
  onFountainSelect: (fountain: Fountain) => void
  loadingState: FountainsLoadingState
  error: string | null
  onRetry: () => void
}

export function FountainList({
  fountains,
  onFountainSelect,
  loadingState,
  error,
  onRetry,
}: FountainListProps) {
  if (loadingState === 'loading') {
    return <LoadingSkeleton />
  }

  if (loadingState === 'error' && error) {
    return (
      <div className="px-4 pt-2 pb-4">
        <Alert variant="destructive">
          <AlertDescription>
            <p className="mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
              <RefreshCw size={14} />
              Riprova
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loadingState === 'success' && fountains.length === 0) {
    return (
      <div className="px-4 pt-2 pb-4">
        <p className="text-sm text-slate-500 text-center py-6">
          Nessuna fontanella trovata con il filtro selezionato.
        </p>
      </div>
    )
  }

  return (
    <ScrollArea>
      <ul
        id="fountain-list"
        aria-label={`Lista fontanelle: ${fountains.length} risultat${fountains.length === 1 ? 'o' : 'i'}`}
        aria-live="polite"
        aria-atomic="false"
        className="divide-y divide-slate-100"
      >
        {fountains.map((fountain) => (
          <FountainListItem key={fountain.id} fountain={fountain} onSelect={onFountainSelect} />
        ))}
      </ul>
    </ScrollArea>
  )
}
