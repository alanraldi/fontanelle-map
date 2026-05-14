import { type HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'active' | 'inactive' | 'unknown' | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-sky-100 text-sky-800 border-sky-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-red-100 text-red-700 border-red-200',
  unknown: 'bg-slate-100 text-slate-600 border-slate-200',
  outline: 'bg-transparent text-slate-700 border-slate-300',
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
