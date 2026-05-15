export interface BoundingBox {
  south: number
  west: number
  north: number
  east: number
}

export interface OverpassElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat: number
  lon: number
  tags?: Record<string, string>
}

export interface OverpassResponse {
  elements: OverpassElement[]
}
