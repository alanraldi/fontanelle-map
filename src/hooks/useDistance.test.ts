import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useDistance } from './useDistance'
import type { Fountain } from '@/types/fountain'

const fountains: Fountain[] = [
  { id: '1', lat: 45.5, lng: 9.2, address: 'Far', city: 'Milano', status: 'active' },
  { id: '2', lat: 41.9, lng: 12.5, address: 'Near', city: 'Roma', status: 'active' },
]

describe('useDistance', () => {
  it('returns original array when no user location', () => {
    const { result } = renderHook(() => useDistance(fountains, null, null))
    expect(result.current).toEqual(fountains)
  })

  it('sorts by distance when user location provided', () => {
    const { result } = renderHook(() => useDistance(fountains, 41.9, 12.5))
    expect(result.current[0].address).toBe('Near')
    expect(result.current[1].address).toBe('Far')
  })

  it('attaches distance to each fountain', () => {
    const { result } = renderHook(() => useDistance(fountains, 41.9, 12.5))
    expect(result.current[0].distance).toBeDefined()
    expect(typeof result.current[0].distance).toBe('number')
  })
})
