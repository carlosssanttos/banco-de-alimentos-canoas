import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  message?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({
  message = 'Nenhum registro encontrado.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
      <div className="mb-3 text-gray-300">
        {icon || <Inbox size={48} strokeWidth={1.5} />}
      </div>
      <p className="text-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
