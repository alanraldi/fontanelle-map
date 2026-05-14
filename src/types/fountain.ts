export interface Fountain {
  id: string
  lat: number
  lng: number
  address: string
  city: string
  status: 'active' | 'inactive' | 'unknown'
  distance?: number
}

export type FountainStatus = Fountain['status']

export type FilterOption = FountainStatus | 'all'
