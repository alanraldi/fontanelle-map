import { type HTMLAttributes, type ReactNode } from 'react'
import { AlertCircle, Info, CheckCircle2 } from 'lucide-react'

type AlertVariant = 'default' | 'destructive' | 'success'

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
}

const variantClasses: Record<AlertVariant, string> = {
  default: 'border-slate-200 bg-slate-50 text-slate-700',
  destructive: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-700',
}

const AlertIcon: Record<AlertVariant, ReactNode> = {
  default: <Info size={16} aria-hidden="true" />,
  destructive: <AlertCircle size={16} aria-hidden="true" />,
  success: <CheckCircle2 size={16} aria-hidden="true" />,
}

export function Alert({
  variant = 'default',
  className = '',
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <span className="mt-0.5 shrink-0">{AlertIcon[variant]}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export function AlertDescription({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`text-sm ${className}`} {...props}>
      {children}
    </div>
  )
}
