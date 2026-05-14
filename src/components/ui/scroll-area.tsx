import { type HTMLAttributes } from 'react'

export function ScrollArea({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
