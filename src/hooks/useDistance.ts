import { useMemo } from 'react'
import type { Fountain } from '@/types/fountain'
import { sortByDistance } from '@/utils/distance'

export function useDistance(
  fountains: Fountain[],
  userLat: number | null,
  userLng: number | null,
): Fountain[] {
  return useMemo(() => {
    if (userLat === null || userLng === null) return fountains
    return sortByDistance(fountains, userLat, userLng)
  }, [fountains, userLat, userLng])
}
