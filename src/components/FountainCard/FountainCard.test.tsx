import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FountainCard } from './index'
import { GeolocationProvider } from '@/contexts/GeolocationContext'
import type { Fountain } from '@/types/fountain'

const mockFountain: Fountain = {
  id: '1',
  lat: 41.9,
  lng: 12.5,
  address: 'Via Roma 1',
  city: 'Roma',
  status: 'active',
  distance: 250,
}

function renderCard(props?: Partial<Parameters<typeof FountainCard>[0]>) {
  return render(
    <GeolocationProvider>
      <FountainCard fountain={mockFountain} onClose={vi.fn()} {...props} />
    </GeolocationProvider>,
  )
}

describe('FountainCard', () => {
  it('renders address and city', () => {
    renderCard()
    expect(screen.getByText('Via Roma 1')).toBeInTheDocument()
    expect(screen.getByText('Roma')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    renderCard()
    expect(screen.getByText('Attiva')).toBeInTheDocument()
  })

  it('renders formatted distance', () => {
    renderCard()
    expect(screen.getByText('250m')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn()
    renderCard({ onClose })
    await userEvent.click(screen.getByRole('button', { name: /chiudi/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders inactive status correctly', () => {
    const inactive: Fountain = { ...mockFountain, status: 'inactive' }
    renderCard({ fountain: inactive })
    expect(screen.getByText('Inattiva')).toBeInTheDocument()
  })

  it('renders unknown status correctly', () => {
    const unknown: Fountain = { ...mockFountain, status: 'unknown' }
    renderCard({ fountain: unknown })
    expect(screen.getByText('Sconosciuta')).toBeInTheDocument()
  })

  it('omits distance when not provided', () => {
    const noDistance: Fountain = { ...mockFountain, distance: undefined }
    renderCard({ fountain: noDistance })
    expect(screen.queryByText('250m')).not.toBeInTheDocument()
  })

  it('renders article with accessible label', () => {
    renderCard()
    expect(screen.getByRole('article', { name: /dettagli/i })).toBeInTheDocument()
  })
})
