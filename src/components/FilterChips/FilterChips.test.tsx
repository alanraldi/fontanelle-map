import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FilterChips } from './index'

describe('FilterChips', () => {
  it('renders all filter options', () => {
    render(<FilterChips filter="all" onFilterChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Tutte' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Attive' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inattive' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sconosciute' })).toBeInTheDocument()
  })

  it('marks active filter as pressed', () => {
    render(<FilterChips filter="active" onFilterChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Attive' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Tutte' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onFilterChange with correct value', async () => {
    const onFilterChange = vi.fn()
    render(<FilterChips filter="all" onFilterChange={onFilterChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Attive' }))
    expect(onFilterChange).toHaveBeenCalledWith('active')
  })

  it('calls onFilterChange with "all" when "Tutte" clicked', async () => {
    const onFilterChange = vi.fn()
    render(<FilterChips filter="active" onFilterChange={onFilterChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Tutte' }))
    expect(onFilterChange).toHaveBeenCalledWith('all')
  })

  it('displays counts when provided', () => {
    render(
      <FilterChips
        filter="all"
        onFilterChange={vi.fn()}
        counts={{ all: 42, active: 30, inactive: 8, unknown: 4 }}
      />,
    )
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('has accessible nav landmark', () => {
    render(<FilterChips filter="all" onFilterChange={vi.fn()} />)
    expect(screen.getByRole('navigation', { name: /filtra/i })).toBeInTheDocument()
  })
})
