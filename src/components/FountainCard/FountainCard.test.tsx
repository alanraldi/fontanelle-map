import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FountainCard } from './index'
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

describe('FountainCard', () => {
  it('renders address and city', () => {
    render(<FountainCard fountain={mockFountain} onClose={vi.fn()} />)
    expect(screen.getByText('Via Roma 1')).toBeInTheDocument()
    expect(screen.getByText('Roma')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<FountainCard fountain={mockFountain} onClose={vi.fn()} />)
    expect(screen.getByText('Attiva')).toBeInTheDocument()
  })

  it('renders formatted distance', () => {
    render(<FountainCard fountain={mockFountain} onClose={vi.fn()} />)
    expect(screen.getByText('250m')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn()
    render(<FountainCard fountain={mockFountain} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /chiudi/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders inactive status correctly', () => {
    const inactive: Fountain = { ...mockFountain, status: 'inactive' }
    render(<FountainCard fountain={inactive} onClose={vi.fn()} />)
    expect(screen.getByText('Inattiva')).toBeInTheDocument()
  })

  it('renders unknown status correctly', () => {
    const unknown: Fountain = { ...mockFountain, status: 'unknown' }
    render(<FountainCard fountain={unknown} onClose={vi.fn()} />)
    expect(screen.getByText('Sconosciuta')).toBeInTheDocument()
  })

  it('omits distance when not provided', () => {
    const noDistance: Fountain = { ...mockFountain, distance: undefined }
    render(<FountainCard fountain={noDistance} onClose={vi.fn()} />)
    expect(screen.queryByText('250m')).not.toBeInTheDocument()
  })

  it('renders article with accessible label', () => {
    render(<FountainCard fountain={mockFountain} onClose={vi.fn()} />)
    expect(screen.getByRole('article', { name: /dettagli/i })).toBeInTheDocument()
  })
})
