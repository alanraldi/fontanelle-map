import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

export type GeolocationStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'denied'
  | 'unavailable'
  | 'error'

export interface GeolocationState {
  lat: number | null
  lng: number | null
  status: GeolocationStatus
  error: string | null
  requestLocation: () => void
}

const GeolocationContext = createContext<GeolocationState | null>(null)

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [trigger, setTrigger] = useState(0)

  const requestLocation = useCallback(() => {
    setTrigger((n) => n + 1)
  }, [])

  useEffect(() => {
    if (trigger === 0) return

    if (!navigator.geolocation) {
      setStatus('unavailable')
      setError('Geolocalizzazione non supportata dal browser')
      return
    }

    let mounted = true
    setStatus('loading')
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mounted) return
        setLat(position.coords.latitude)
        setLng(position.coords.longitude)
        setStatus('success')
      },
      (err) => {
        if (!mounted) return
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied')
          setError('Accesso alla posizione negato')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setStatus('unavailable')
          setError('Posizione non disponibile')
        } else {
          setStatus('error')
          setError('Impossibile ottenere la posizione')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )

    return () => {
      mounted = false
    }
  }, [trigger])

  return (
    <GeolocationContext.Provider value={{ lat, lng, status, error, requestLocation }}>
      {children}
    </GeolocationContext.Provider>
  )
}

export function useGeolocationContext(): GeolocationState {
  const ctx = useContext(GeolocationContext)
  if (!ctx) throw new Error('useGeolocationContext must be used within GeolocationProvider')
  return ctx
}
