import { useState, useEffect } from 'react'
import type { Fountain } from '@/types/fountain'

const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php'

interface WikimediaPage {
  imageinfo?: Array<{ url: string; thumburl?: string }>
}

interface WikimediaResponse {
  query?: { pages?: Record<string, WikimediaPage> }
}

export interface FountainImageResult {
  imageUrl: string | null
  loading: boolean
  isWikimedia: boolean
}

export function useFountainImage(fountain: Fountain): FountainImageResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setImageUrl(null)
    setLoading(false)

    if (fountain.image) {
      setImageUrl(fountain.image)
      return
    }

    if (!fountain.wikimediaCommons) return

    const file = fountain.wikimediaCommons.startsWith('File:')
      ? fountain.wikimediaCommons
      : `File:${fountain.wikimediaCommons}`

    const controller = new AbortController()
    const url =
      `${WIKIMEDIA_API}?action=query&titles=${encodeURIComponent(file)}` +
      `&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*`

    setLoading(true)

    fetch(url, { signal: controller.signal })
      .then((res) => res.json() as Promise<WikimediaResponse>)
      .then((data) => {
        const pages = data?.query?.pages
        if (!pages) return
        const page = Object.values(pages)[0]
        const info = page?.imageinfo?.[0]
        if (info) setImageUrl(info.thumburl ?? info.url)
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [fountain.id, fountain.image, fountain.wikimediaCommons])

  return {
    imageUrl,
    loading,
    isWikimedia: !fountain.image && Boolean(fountain.wikimediaCommons),
  }
}
