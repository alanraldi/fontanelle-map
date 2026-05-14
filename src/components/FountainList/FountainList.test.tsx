import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FountainList } from './index'
import type { Fountain } from '@/types/fountain'

const fountains: Fountain[] = [
  { id: '1', lat: 41.9, lng: 12.5, address: 'Via Roma 1', city: 'Roma', status: 'active', distance: 100 },
  { id: '2', lat: 41.8, lng: 12.4, address: 'Piazza Navona', city: 'Roma', status: 'inactive', distance: 500 },
]

describe('FountainList', () => {
  it('renders fountain items', () => {
    render(
      <FountainList
        fountains={fountains}
        onFountainSelect={vi.fn()}
        loadingState="success"
        error={null}
        onRetry={vi.fn()}
      />,
    )
    expect(screen.getByText('Via Roma 1')).toBeInTheDocument()
    expect(screen.getByText('Piazza Navona')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    render(
      <FountainList
        fountains={[]}
        onFountainSelect={vi.fn()}
        loadingState="loading"
        error={null}
        onRetry={vi.fn()}
      />,
    )
    expect(screen.getByLabelText(/caricamento/i)).toBeInTheDocument()
  })

  it('shows error and retry button on error', () => {
    const onRetry = vi.fn()
    render(
      <FountainList
        fountains={[]}
        onFountainSelect={vi.fn()}
        loadingState="error"
        error="Timeout: richiesta scaduta."
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText(/timeout/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /riprova/i })).toBeInTheDocument()
  })

  it('calls onRetry when retry button clicked', async () => {
    const onRetry = vi.fn()
    render(
      <FountainList
        fountains={[]}
        onFountainSelect={vi.fn()}
        loadingState="error"
        error="Errore"
        onRetry={onRetry}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /riprova/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows empty state message when no fountains', () => {
    render(
      <FountainList
        fountains={[]}
        onFountainSelect={vi.fn()}
        loadingState="success"
        error={null}
        onRetry={vi.fn()}
      />,
    )
    expect(screen.getByText(/nessuna fontanella/i)).toBeInTheDocument()
  })

  it('calls onFountainSelect when item clicked', async () => {
    const onFountainSelect = vi.fn()
    render(
      <FountainList
        fountains={fountains}
        onFountainSelect={onFountainSelect}
        loadingState="success"
        error={null}
        onRetry={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /via roma/i }))
    expect(onFountainSelect).toHaveBeenCalledWith(fountains[0])
  })

  it('renders list with aria-live for dynamic updates', () => {
    render(
      <FountainList
        fountains={fountains}
        onFountainSelect={vi.fn()}
        loadingState="success"
        error={null}
        onRetry={vi.fn()}
      />,
    )
    const list = screen.getByRole('list', { name: /lista fontanelle/i })
    expect(list).toHaveAttribute('aria-live', 'polite')
  })
})
