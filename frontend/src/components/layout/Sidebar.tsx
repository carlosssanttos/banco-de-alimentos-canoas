import { NavLink } from 'react-router'
import {
  LayoutDashboard,
  Package,
  Archive,
  Truck,
  Building2,
  Users,
  AlertTriangle,
  Bell,
  UserCog,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: number
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { to: '/dashboard',      label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/alimentos',      label: 'Alimentos',       icon: Package },
  { to: '/lotes',          label: 'Estoque / Lotes', icon: Archive },
  { to: '/distribuicoes',  label: 'Distribuições',   icon: Truck },
  { to: '/parceiros',      label: 'Parceiros',       icon: Building2 },
  { to: '/entidades',      label: 'Entidades',       icon: Users },
  { to: '/vencendo',       label: 'Vencendo',        icon: AlertTriangle },
  { to: '/notifications',  label: 'Notificações',    icon: Bell },
  { to: '/usuarios',       label: 'Usuários',        icon: UserCog, adminOnly: true },
]

interface SidebarProps {
  vencendoCount?: number
  notifsCount?: number
}

export function Sidebar({ vencendoCount = 0, notifsCount = 0 }: SidebarProps) {
  const { isAdmin } = useAuth()

  const getCount = (item: NavItem) => {
    if (item.to === '/vencendo') return vencendoCount
    if (item.to === '/notifications') return notifsCount
    return 0
  }

  return (
    <aside className="flex h-full w-60 flex-col bg-brand-600 text-white">
      {/* Logo */}
      <div className="flex flex-col items-center px-5 py-4 border-b border-brand-700">
        <img
          src="/Logo Banco de Alimentos - Branco.png"
          alt="Banco de Alimentos Canoas"
          className="w-full max-w-[120px] object-contain"
        />
        <p className="mt-1 text-[10px] text-brand-200 font-medium tracking-widest uppercase">Sistema de Gestão</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const count = getCount(item)
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-700 text-white border-l-4 border-white pl-3'
                      : 'text-brand-100 hover:bg-brand-700/60 hover:text-white'
                  )
                }
              >
                <Icon size={18} className="shrink-0" />
                <span className="flex-1">{item.label}</span>
                {count > 0 && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/20 px-1.5 text-[10px] font-bold">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </NavLink>
            )
          })}
      </nav>

      {/* Footer */}
      <div className="border-t border-brand-700 px-4 py-3">
        <p className="text-[10px] text-brand-300 text-center">
          Sistema de Gestão v1.0
        </p>
      </div>
    </aside>
  )
}
