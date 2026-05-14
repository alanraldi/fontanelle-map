import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BottomSheet } from './index'
import type { Fountain } from '@/types/fountain'

const fountain: Fountain = {
  id: '1',
  lat: 41.9,
  lng: 12.5,
  address: 'Via Roma 1',
  city: 'Roma',
  status: 'active',
}

describe('BottomSheet', () => {
  it('renders children', () => {
    render(
      <BottomSheet selectedFountain={null} onClose={vi.fn()}>
        <p>Content</p>
      </BottomSheet>,
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('has correct aria-label when no fountain selected', () => {
    render(
      <BottomSheet selectedFountain={null} onClose={vi.fn()}>
        <div />
      </BottomSheet>,
    )
    expect(screen.getByRole('region', { name: /lista fontanelle/i })).toBeInTheDocument()
  })

  it('has correct aria-label when fountain selected', () => {
    render(
      <BottomSheet selectedFountain={fountain} onClose={vi.fn()}>
        <div />
      </BottomSheet>,
    )
    expect(screen.getByRole('region', { name: /dettagli/i })).toBeInTheDocument()
  })

  it('toggle button has correct aria-expanded initially (false)', () => {
    render(
      <BottomSheet selectedFountain={null} onClose={vi.fn()}>
        <div />
      </BottomSheet>,
    )
    expect(screen.getByRole('button', { name: /espandi/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('expands on toggle button click', async () => {
    render(
      <BottomSheet selectedFountain={null} onClose={vi.fn()}>
        <div />
      </BottomSheet>,
    )
    const btn = screen.getByRole('button', { name: /espandi/i })
    await userEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })
})
