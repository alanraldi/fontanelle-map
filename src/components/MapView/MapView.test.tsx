import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MapView } from './index'
import { GeolocationProvider } from '@/contexts/GeolocationContext'
import type { Fountain } from '@/types/fountain'

const fountains: Fountain[] = [
  { id: '1', lat: 41.9, lng: 12.5, address: 'Via Roma', city: 'Roma', status: 'active' },
]

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
        {...props}
      />
    </GeolocationProvider>,
  )
}

describe('MapView', () => {
  it('renders map container on success state', () => {
    renderMapView()
    expect(screen.getByRole('generic')).toBeInTheDocument()
  })

  it('shows loading skeleton on loading state', () => {
    renderMapView({ loadingState: 'loading', fountains: [] })
    expect(screen.getByText(/caricamento fontanelle/i)).toBeInTheDocument()
  })

  it('shows error state with retry button', () => {
    const onRetry = vi.fn()
    renderMapView({ loadingState: 'error', error: 'Timeout', onRetry, fountains: [] })
    expect(screen.getByText(/errore/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /riprova/i })).toBeInTheDocument()
  })

  it('calls onRetry on error retry click', async () => {
    const onRetry = vi.fn()
    renderMapView({ loadingState: 'error', error: 'Errore', onRetry, fountains: [] })
    await userEvent.click(screen.getByRole('button', { name: /riprova/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
