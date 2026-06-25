import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router'
import { cn } from '@/utils/cn'

interface NotificationBellProps {
  count: number
}

export function NotificationBell({ count }: NotificationBellProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/notifications')}
      className="relative rounded-lg p-2 text-gray-500 hover:bg-surface-muted hover:text-gray-700 transition-colors"
      aria-label={`Notificações${count > 0 ? ` (${count} não lidas)` : ''}`}
    >
      <Bell size={20} />
      {count > 0 && (
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center',
            'rounded-full bg-status-danger text-[10px] font-bold text-white'
          )}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
