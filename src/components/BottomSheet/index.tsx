import { useState, useEffect, useRef, type ReactNode } from 'react'
import type { Fountain } from '@/types/fountain'

const COLLAPSED_HEIGHT_PX = 64
const EXPANDED_HEIGHT_VH = 52

interface BottomSheetProps {
  selectedFountain: Fountain | null
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ selectedFountain, onClose, children }: BottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    if (selectedFountain) setIsExpanded(true)
  }, [selectedFountain])

  const toggle = () => {
    if (isExpanded && selectedFountain) onClose()
    setIsExpanded((v) => !v)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return
    const delta = e.changedTouches[0].clientY - touchStartY.current
    if (delta > 40) {
      if (isExpanded && selectedFountain) onClose()
      setIsExpanded(false)
    } else if (delta < -40) {
      setIsExpanded(true)
    }
    touchStartY.current = null
  }

  const height = isExpanded ? `${EXPANDED_HEIGHT_VH}vh` : `${COLLAPSED_HEIGHT_PX}px`

  return (
    <div
      ref={sheetRef}
      role="region"
      aria-label={selectedFountain ? `Dettagli fontanella` : 'Lista fontanelle'}
      className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-2xl shadow-2xl"
      style={{
        height,
        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        className="w-full flex flex-col items-center justify-center py-3 touch-none"
        onClick={toggle}
        aria-label={isExpanded ? 'Riduci pannello' : 'Espandi pannello'}
        aria-expanded={isExpanded}
        aria-controls="bottom-sheet-content"
      >
        <div className="w-8 h-1 bg-slate-300 rounded-full" aria-hidden="true" />
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
