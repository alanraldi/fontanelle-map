import { describe, it, expect } from 'vitest'
import { normalizeFeature } from './normalize'
import type { GeoJSONFeature } from '@/types/geojson'

function makeFeature(overrides: Partial<GeoJSONFeature['properties']> = {}): GeoJSONFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [12.5, 41.9] },
    properties: { id: '42', address: 'Via Roma', city: 'Roma', stato_funzionamento: 'attivo', ...overrides },
  }
}

describe('normalizeFeature', () => {
  it('normalizes coordinates (GeoJSON is [lng, lat])', () => {
    const result = normalizeFeature(makeFeature())
    expect(result?.lat).toBe(41.9)
    expect(result?.lng).toBe(12.5)
  })

  it('normalizes active status', () => {
    const result = normalizeFeature(makeFeature({ stato_funzionamento: 'attivo' }))
    expect(result?.status).toBe('active')
  })

  it('normalizes inactive status', () => {
    const result = normalizeFeature(makeFeature({ stato_funzionamento: 'inattivo' }))
    expect(result?.status).toBe('inactive')
  })

  it('normalizes unknown status for empty string', () => {
    const result = normalizeFeature(makeFeature({ stato_funzionamento: '' }))
    expect(result?.status).toBe('unknown')
  })

  it('returns null for non-Point geometry', () => {
    const feature: GeoJSONFeature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [12.5, 41.9] },
      properties: {},
    }
    ;(feature.geometry as unknown as { type: string }).type = 'LineString'
    expect(normalizeFeature(feature)).toBeNull()
  })

  it('extracts id from properties', () => {
    const result = normalizeFeature(makeFeature({ id: 'abc-123' }))
    expect(result?.id).toBe('abc-123')
  })

  it('generates id when not present', () => {
    const feature = makeFeature()
    delete feature.properties.id
    const result = normalizeFeature(feature)
    expect(result?.id).toMatch(/^fountain-/)
  })

  it('normalizes indirizzo as address fallback', () => {
    const result = normalizeFeature(makeFeature({ address: undefined, indirizzo: 'Via Test' }))
    expect(result?.address).toBe('Via Test')
  })

  it('normalizes comune as city fallback', () => {
    const result = normalizeFeature(makeFeature({ city: undefined, comune: 'Napoli' }))
    expect(result?.city).toBe('Napoli')
  })
})
