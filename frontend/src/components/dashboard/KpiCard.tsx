import { cn } from '@/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  variant?: 'default' | 'warning' | 'success' | 'danger'
  subtitle?: string
}

const variants = {
  default: { bg: 'bg-brand-50', icon: 'text-brand-600', border: 'border-brand-100' },
  warning: { bg: 'bg-yellow-50', icon: 'text-yellow-600', border: 'border-yellow-100' },
  success: { bg: 'bg-green-50',  icon: 'text-green-600',  border: 'border-green-100'  },
  danger:  { bg: 'bg-red-50',    icon: 'text-red-600',    border: 'border-red-100'    },
}

export function KpiCard({ title, value, icon: Icon, variant = 'default', subtitle }: KpiCardProps) {
  const v = variants[variant]
  return (
    <div className={cn('rounded-xl border p-5 bg-white shadow-sm flex items-center gap-4', v.border)}>
      <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl shrink-0', v.bg)}>
        <Icon size={24} className={v.icon} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
        <p className="text-3xl font-bold text-gray-900 leading-tight">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
