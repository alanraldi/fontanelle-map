import { describe, it, expect } from 'vitest'
import { sortByDistance, formatDistance } from './distance'
import type { Fountain } from '@/types/fountain'

const fountains: Fountain[] = [
  { id: '1', lat: 45.5, lng: 9.2, address: 'Far', city: 'Milano', status: 'active' },
  { id: '2', lat: 41.9, lng: 12.5, address: 'Near', city: 'Roma', status: 'active' },
]

describe('sortByDistance', () => {
  it('sorts fountains by ascending distance from user', () => {
    const sorted = sortByDistance(fountains, 41.9, 12.5)
    expect(sorted[0].address).toBe('Near')
    expect(sorted[1].address).toBe('Far')
  })

  it('attaches distance property', () => {
    const sorted = sortByDistance(fountains, 41.9, 12.5)
    expect(sorted[0].distance).toBeDefined()
    expect(sorted[0].distance).toBeLessThan(100)
  })

  it('does not mutate original array', () => {
    const original = [...fountains]
    sortByDistance(fountains, 41.9, 12.5)
    expect(fountains[0].id).toBe(original[0].id)
  })
})

describe('formatDistance', () => {
  it('formats meters below 1km', () => {
    expect(formatDistance(250)).toBe('250m')
  })

  it('formats kilometers', () => {
    expect(formatDistance(1500)).toBe('1.5km')
  })

  it('rounds meters to integer', () => {
    expect(formatDistance(123.7)).toBe('124m')
  })
})
