import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useFountains } from './useFountains'

const mockGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [12.5, 41.9] },
      properties: { id: '1', address: 'Via Roma', city: 'Roma', stato_funzionamento: 'attivo' },
    },
  ],
}

describe('useFountains', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts in loading state after mount', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => new Promise(() => { /* never resolves, stays loading */ }),
    } as Response)

    const { result } = renderHook(() => useFountains())
    expect(result.current.loadingState).toBe('loading')
  })

  it('transitions to loading then success', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGeoJSON),
    } as Response)

    const { result } = renderHook(() => useFountains())

    await waitFor(() => {
      expect(result.current.loadingState).toBe('success')
    })

    expect(result.current.fountains).toHaveLength(1)
    expect(result.current.fountains[0].address).toBe('Via Roma')
    expect(result.current.lastFetchedAt).toBeInstanceOf(Date)
  })

  it('transitions to error on HTTP failure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response)

    const { result } = renderHook(() => useFountains())

    await waitFor(() => {
      expect(result.current.loadingState).toBe('error')
    })

    expect(result.current.error).toMatch(/404/)
  })

  it('transitions to error on network failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network Error'))

    const { result } = renderHook(() => useFountains())

    await waitFor(() => {
      expect(result.current.loadingState).toBe('error')
    })

    expect(result.current.error).toBe('Network Error')
  })

  it('exposes refetch function', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGeoJSON),
    } as Response)
    const { result } = renderHook(() => useFountains())
    expect(typeof result.current.refetch).toBe('function')
  })
})
