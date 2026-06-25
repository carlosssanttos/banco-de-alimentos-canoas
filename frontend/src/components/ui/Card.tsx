import { cn } from '@/utils/cn'
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn('bg-surface-card rounded-xl border border-surface-border shadow-sm', className)}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <div {...props} className={cn('px-6 py-4 border-b border-surface-border', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className, ...props }: CardProps) {
  return (
    <div {...props} className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}
