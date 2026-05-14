import type { FilterOption } from '@/types/fountain'

const FILTER_OPTIONS: Array<{ value: FilterOption; label: string; color?: string }> = [
  { value: 'all', label: 'Tutte' },
  { value: 'active', label: 'Attive', color: '#16a34a' },
  { value: 'inactive', label: 'Inattive', color: '#dc2626' },
  { value: 'unknown', label: 'Sconosciute', color: '#94a3b8' },
]

interface FilterChipsProps {
  filter: FilterOption
  onFilterChange: (filter: FilterOption) => void
  counts?: Partial<Record<FilterOption, number>>
}

export function FilterChips({ filter, onFilterChange, counts }: FilterChipsProps) {
  return (
    <nav
      aria-label="Filtra fontanelle per stato"
      className="flex items-center gap-2 px-4 py-2 overflow-x-auto [-webkit-overflow-scrolling:touch] scrollbar-none"
    >
      {FILTER_OPTIONS.map(({ value, label, color }) => {
        const isActive = filter === value
        const count = counts?.[value]

        return (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            aria-pressed={isActive}
            aria-label={`${label}${count !== undefined ? `, ${count} fontanell${count === 1 ? 'a' : 'e'}` : ''}`}
            className={[
              'flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1',
              isActive
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
          >
            {color && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.8)' : color }}
                aria-hidden="true"
              />
            )}
            {label}
            {count !== undefined && (
              <span
                className={`text-xs ${isActive ? 'opacity-80' : 'text-slate-400'}`}
                aria-hidden="true"
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
