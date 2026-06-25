import { Outlet } from 'react-router'
import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useWebSocket } from '@/hooks/useWebSocket'
import { DashboardService } from '@/services/DashboardService'

export function AppLayout() {
  const { naoLidas } = useWebSocket()
  const [vencendoCount, setVencendoCount] = useState(0)

  useEffect(() => {
    DashboardService.resumo()
      .then((data) => setVencendoCount(data.lotes_vencendo))
      .catch(() => undefined)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar vencendoCount={vencendoCount} notifsCount={naoLidas} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header notifsCount={naoLidas} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
