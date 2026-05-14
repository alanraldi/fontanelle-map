export interface GeoJSONFeatureProperties {
  id?: string | number
  fid?: string | number
  objectid?: string | number
  name?: string
  address?: string
  indirizzo?: string
  via?: string
  comune?: string
  city?: string
  stato?: string
  stato_funzionamento?: string
  status?: string
  attivo?: boolean | string
  [key: string]: unknown
}

export interface GeoJSONFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: GeoJSONFeatureProperties
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}
