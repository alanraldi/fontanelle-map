import { lazy, Suspense, useState, useMemo, useCallback } from 'react'
import { GeolocationProvider } from '@/contexts/GeolocationContext'
import { useGeolocationContext } from '@/contexts/GeolocationContext'
import { useFountains } from '@/hooks/useFountains'
import { useDistance } from '@/hooks/useDistance'
import { BottomSheet } from '@/components/BottomSheet'
import { FilterChips } from '@/components/FilterChips'
import { FountainList } from '@/components/FountainList'
import { FountainCard } from '@/components/FountainCard'
import { Header } from '@/components/Header'
import type { Fountain, FilterOption } from '@/types/fountain'

const MapView = lazy(() =>
  import('@/components/MapView').then((m) => ({ default: m.MapView })),
)

function AppContent() {
  const { fountains, loadingState, error, refetch } = useFountains()
  const { lat, lng } = useGeolocationContext()
  const sortedFountains = useDistance(fountains, lat, lng)

  const [filter, setFilter] = useState<FilterOption>('all')
  const [selectedFountain, setSelectedFountain] = useState<Fountain | null>(null)

  const filteredFountains = useMemo(
    () =>
      filter === 'all' ? sortedFountains : sortedFountains.filter((f) => f.status === filter),
    [sortedFountains, filter],
  )

  const counts = useMemo(
    () => ({
      all: sortedFountains.length,
      active: sortedFountains.filter((f) => f.status === 'active').length,
      inactive: sortedFountains.filter((f) => f.status === 'inactive').length,
      unknown: sortedFountains.filter((f) => f.status === 'unknown').length,
    }),
    [sortedFountains],
  )

  const handleFountainSelect = useCallback((fountain: Fountain) => {
    setSelectedFountain(fountain)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedFountain(null)
  }, [])

  return (
    <div className="relative w-full overflow-hidden bg-slate-100" style={{ height: '100dvh' }}>
      <a
        href="#fountain-list"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-[9999] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-sky-600 focus:font-medium"
      >
        Vai alla lista delle fontanelle
      </a>

      <Header fountainCount={filteredFountains.length} />

      <Suspense fallback={null}>
        <MapView
          fountains={filteredFountains}
          selectedFountain={selectedFountain}
          onFountainSelect={handleFountainSelect}
          loadingState={loadingState}
          error={error}
          onRetry={refetch}
        />
      </Suspense>

      <BottomSheet selectedFountain={selectedFountain} onClose={handleClose}>
        <FilterChips filter={filter} onFilterChange={setFilter} counts={counts} />
        {selectedFountain ? (
          <FountainCard fountain={selectedFountain} onClose={handleClose} />
        ) : (
          <FountainList
            fountains={filteredFountains}
            onFountainSelect={handleFountainSelect}
            loadingState={loadingState}
            error={error}
            onRetry={refetch}
          />
        )}
      </BottomSheet>
    </div>
  )
}

export function App() {
  return (
    <GeolocationProvider>
      <AppContent />
    </GeolocationProvider>
  )
}
