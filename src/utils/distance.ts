import { haversineDistance } from './haversine'
import type { Fountain } from '@/types/fountain'

export function sortByDistance(
  fountains: Fountain[],
  userLat: number,
  userLng: number,
): Fountain[] {
  return fountains
    .map((f) => ({
      ...f,
      distance: haversineDistance(userLat, userLng, f.lat, f.lng),
    }))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}
