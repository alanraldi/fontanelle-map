import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { createRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { MapView } from './index'
import { GeolocationProvider } from '@/contexts/GeolocationContext'
import type { Fountain } from '@/types/fountain'

const fountains: Fountain[] = [
  { id: '1', lat: 41.9, lng: 12.5, address: 'Via Roma', city: 'Roma', status: 'active' },
]

const mapRef = createRef<LeafletMap | null>()

function renderMapView(props?: Partial<Parameters<typeof MapView>[0]>) {
  return render(
    <GeolocationProvider>
      <MapView
        fountains={fountains}
        selectedFountain={null}
        onFountainSelect={vi.fn()}
        loadingState="success"
        error={null}
        onRetry={vi.fn()}
        onBoundsChange={vi.fn()}
        mapRef={mapRef}
        {...props}
      />
    </GeolocationProvider>,
  )
}

describe('MapView', () => {
  it('renders map container on success state', () => {
    const { container } = renderMapView()
    expect(container.querySelector('.absolute.inset-0.z-0')).toBeInTheDocument()
  })

  it('does not show error overlay on success state', () => {
    renderMapView()
    expect(screen.queryByText(/errore nel caricamento/i)).not.toBeInTheDocument()
  })

  it('does not show error overlay on error state (errors handled by FountainList)', () => {
    renderMapView({ loadingState: 'error', error: 'Timeout', fountains: [] })
    expect(screen.queryByText(/errore nel caricamento/i)).not.toBeInTheDocument()
  })

  it('keeps map visible on error state', () => {
    const { container } = renderMapView({ loadingState: 'error', error: 'Errore', fountains: [] })
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })
})
