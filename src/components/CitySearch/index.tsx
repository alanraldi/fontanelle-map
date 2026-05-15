import { useState, useRef, useEffect } from 'react'
import type { RefObject } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { Search, Loader2 } from 'lucide-react'
import { useNominatim } from '@/hooks/useNominatim'
import type { NominatimResult } from '@/hooks/useNominatim'

interface CitySearchProps {
  mapRef: RefObject<LeafletMap | null>
}

export function CitySearch({ mapRef }: CitySearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const { results, loading } = useNominatim(open ? query : '')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(result: NominatimResult) {
    const [south, north, west, east] = result.boundingbox.map(Number)
    mapRef.current?.fitBounds(
      [
        [south, west],
        [north, east],
      ],
      { maxZoom: 14 },
    )
    setQuery('')
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const showDropdown = open && results.length > 0

  return (
    <div ref={containerRef} className="absolute top-16 left-4 right-4 z-[998]">
      <div className="relative">
        <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-xl shadow-sm px-3 py-2 gap-2 border border-slate-200/60">
          <Search size={15} className="text-slate-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Cerca città…"
            className="flex-1 text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400 min-w-0"
            aria-label="Cerca città"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {loading && (
            <Loader2 size={14} className="text-slate-400 animate-spin shrink-0" aria-hidden="true" />
          )}
        </div>

        {showDropdown && (
          <ul
            role="listbox"
            aria-label="Suggerimenti città"
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden"
          >
            {results.map((result) => (
              <li key={result.place_id} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 truncate"
                >
                  {result.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
