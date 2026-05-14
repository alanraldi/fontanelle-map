import { type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <div className="relative inline-flex items-center">
      {label && <span className="sr-only">{label}</span>}
      <select
        className={`appearance-none rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${className}`}
        aria-label={label}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-2 text-slate-500"
        aria-hidden="true"
      />
    </div>
  )
}
