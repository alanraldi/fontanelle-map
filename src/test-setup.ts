import '@testing-library/jest-dom'

// Mock leaflet.markercluster (requires global L — not available in jsdom)
vi.mock('leaflet.markercluster', () => ({}))
vi.mock('leaflet.markercluster/dist/MarkerCluster.css', () => ({}))
vi.mock('leaflet.markercluster/dist/MarkerCluster.Default.css', () => ({}))
vi.mock('leaflet/dist/leaflet.css', () => ({}))

// Mock leaflet — DOM not available in jsdom with full Leaflet
vi.mock('@/lib/leaflet', () => ({
  L: {
    divIcon: vi.fn(() => ({})),
    marker: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
    markerClusterGroup: vi.fn(() => ({
      addLayer: vi.fn().mockReturnThis(),
      clearLayers: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
      getBounds: vi.fn(() => ({ isValid: vi.fn(() => false) })),
    })),
    Map: vi.fn(),
    Icon: {
      Default: {
        prototype: {},
        mergeOptions: vi.fn(),
      },
    },
  },
}))

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => children,
  TileLayer: () => null,
  useMap: vi.fn(() => ({
    setView: vi.fn(),
    getZoom: vi.fn(() => 12),
    fitBounds: vi.fn(),
    flyTo: vi.fn(),
    getBounds: vi.fn(() => ({
      getSouth: vi.fn(() => 41.8),
      getWest: vi.fn(() => 12.4),
      getNorth: vi.fn(() => 42.0),
      getEast: vi.fn(() => 12.6),
    })),
    on: vi.fn(),
    off: vi.fn(),
  })),
}))

// Stub VITE_GEOJSON_URL for all tests
vi.stubEnv('VITE_GEOJSON_URL', 'https://test.example.com/fountains.geojson')

// Suppress console errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = String(args[0])
    if (msg.includes('ReactDOM.render') || msg.includes('act(')) return
    originalError(...args)
  }
})
afterAll(() => {
  console.error = originalError
})
