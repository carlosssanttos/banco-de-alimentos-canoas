import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

interface AlertProps {
  variant?: 'success' | 'warning' | 'danger' | 'info'
  children: ReactNode
  className?: string
}

const config = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: CheckCircle2,
    iconClass: 'text-green-500',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: AlertTriangle,
    iconClass: 'text-yellow-500',
  },
  danger: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: XCircle,
    iconClass: 'text-red-500',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: Info,
    iconClass: 'text-blue-500',
  },
}

export function Alert({ variant = 'info', children, className }: AlertProps) {
  const { container, icon: Icon, iconClass } = config[variant]
  return (
    <div className={cn('flex items-start gap-3 rounded-lg border p-4 text-sm', container, className)}>
      <Icon size={18} className={cn('mt-0.5 shrink-0', iconClass)} />
      <div>{children}</div>
    </div>
  )
}
