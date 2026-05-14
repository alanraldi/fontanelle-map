import { Droplets, MapPin, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGeolocationContext } from '@/contexts/GeolocationContext'

interface HeaderProps {
  fountainCount: number
}

export function Header({ fountainCount }: HeaderProps) {
  const { status, requestLocation } = useGeolocationContext()

  const isLocating = status === 'loading'
  const hasLocation = status === 'success'

  return (
    <header
      className="absolute top-0 left-0 right-0 z-[999] flex items-center justify-between px-4 py-3 pointer-events-none"
      aria-label="Intestazione mappa"
    >
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm pointer-events-auto">
        <Droplets size={20} className="text-sky-500" aria-hidden="true" />
        <span className="font-semibold text-slate-900 text-sm">Fontanelle Map</span>
        {fountainCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={11} aria-hidden="true" />
            {fountainCount}
          </span>
        )}
      </div>

      <Button
        variant={hasLocation ? 'primary' : 'outline'}
        size="sm"
        onClick={requestLocation}
        disabled={isLocating}
        aria-label={
          isLocating
            ? 'Ricerca posizione in corso…'
            : hasLocation
              ? 'Posizione trovata — clicca per aggiornare'
              : 'Trova la tua posizione'
        }
        className="pointer-events-auto gap-1.5 shadow-sm bg-white/90 backdrop-blur-sm"
      >
        <Navigation
          size={14}
          className={isLocating ? 'animate-spin' : ''}
          aria-hidden="true"
        />
        {isLocating ? 'Ricerca…' : hasLocation ? 'GPS' : 'Posizione'}
      </Button>
    </header>
  )
}
