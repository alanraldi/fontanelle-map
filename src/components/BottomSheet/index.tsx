import { useState, useEffect, useRef, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import type { Fountain } from '@/types/fountain'

const COLLAPSED_HEIGHT_PX = 64
const EXPANDED_HEIGHT_VH = 52
const DRAG_THRESHOLD = 40

interface BottomSheetProps {
  selectedFountain: Fountain | null
  onClose: () => void
  isLoading?: boolean
  children: ReactNode
}

export function BottomSheet({ selectedFountain, onClose, isLoading = false, children }: BottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const pointerStartY = useRef<number | null>(null)

  useEffect(() => {
    if (selectedFountain) setIsExpanded(true)
  }, [selectedFountain])

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    pointerStartY.current = e.clientY
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerStartY.current === null) return
    const delta = e.clientY - pointerStartY.current
    pointerStartY.current = null

    if (delta > DRAG_THRESHOLD) {
      if (isExpanded && selectedFountain) onClose()
      setIsExpanded(false)
    } else if (delta < -DRAG_THRESHOLD) {
      setIsExpanded(true)
    } else {
      if (isExpanded && selectedFountain) onClose()
      setIsExpanded((v) => !v)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (isExpanded && selectedFountain) onClose()
      setIsExpanded((v) => !v)
    }
  }

  const height = isExpanded ? `${EXPANDED_HEIGHT_VH}vh` : `${COLLAPSED_HEIGHT_PX}px`

  return (
    <div
      role="region"
      aria-label={selectedFountain ? 'Dettagli fontanella' : 'Lista fontanelle'}
      className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-2xl shadow-2xl"
      style={{
        height,
        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <button
        className="w-full flex flex-col items-center justify-center py-3 touch-none select-none cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        aria-label={isExpanded ? 'Riduci pannello' : 'Espandi pannello'}
        aria-expanded={isExpanded}
        aria-controls="bottom-sheet-content"
      >
        <div className="w-8 h-1 bg-slate-300 rounded-full" aria-hidden="true" />
        {isLoading && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400" aria-live="polite">
            <Loader2 size={11} className="animate-spin" aria-hidden="true" />
            <span>Aggiornando...</span>
          </div>
        )}
      </button>

      <div
        id="bottom-sheet-content"
        className="overflow-y-auto h-[calc(100%-2.5rem)] [-webkit-overflow-scrolling:touch]"
      >
        {children}
      </div>
    </div>
  )
}
