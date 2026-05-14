import { describe, it, expect } from 'vitest'
import { haversineDistance } from './haversine'

describe('haversineDistance', () => {
  it('returns 0 for same point', () => {
    expect(haversineDistance(41.9, 12.5, 41.9, 12.5)).toBe(0)
  })

  it('calculates distance between Roma and Milano (approx 480km)', () => {
    const dist = haversineDistance(41.9028, 12.4964, 45.4654, 9.1866)
    expect(dist / 1000).toBeCloseTo(477, -1)
  })

  it('returns distance in meters', () => {
    const dist = haversineDistance(41.9, 12.5, 41.9, 12.501)
    expect(dist).toBeGreaterThan(0)
    expect(dist).toBeLessThan(200)
  })

  it('is symmetric', () => {
    const d1 = haversineDistance(41.9, 12.5, 45.4, 9.2)
    const d2 = haversineDistance(45.4, 9.2, 41.9, 12.5)
    expect(d1).toBeCloseTo(d2, 5)
  })
})
