import { Bell, CheckCheck, BellOff } from 'lucide-react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { fromNow } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import type { Notificacao } from '@/types'

const tipoVariant: Record<Notificacao['tipo'], 'warning' | 'danger' | 'info' | 'neutral'> = {
  vencimento:    'warning',
  estoque_baixo: 'danger',
  distribuicao:  'info',
  lote:          'neutral',
  sistema:       'neutral',
}

const tipoLabel: Record<Notificacao['tipo'], string> = {
  vencimento:    'Vencimento',
  estoque_baixo: 'Estoque Baixo',
  distribuicao:  'Distribuição',
  lote:          'Lote',
  sistema:       'Sistema',
}

export function Notifications() {
  const { notificacoes, naoLidas, marcarLida, marcarTodasLidas } = useWebSocket()

  return (
    <>
      <PageHeader
        title="Notificações"
        subtitle={`${naoLidas} não lida${naoLidas !== 1 ? 's' : ''}`}
        action={
          naoLidas > 0 ? (
            <Button variant="secondary" size="sm" onClick={marcarTodasLidas}>
              <CheckCheck size={15} /> Marcar todas como lidas
            </Button>
          ) : undefined
        }
      />

      {notificacoes.length === 0 ? (
        <EmptyState
          icon={<BellOff size={48} strokeWidth={1.5} />}
          message="Nenhuma notificação recebida ainda. Notificações em tempo real aparecerão aqui."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {notificacoes.map((n) => (
            <Card
              key={n.id}
              className={cn('transition-colors', !n.lida && 'border-l-4 border-l-brand-500 bg-brand-50/30')}
            >
              <div className="flex items-start gap-4 px-5 py-4">
                <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', !n.lida ? 'bg-brand-100' : 'bg-surface-muted')}>
                  <Bell size={18} className={!n.lida ? 'text-brand-600' : 'text-gray-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={tipoVariant[n.tipo]}>{tipoLabel[n.tipo]}</Badge>
                    {!n.lida && <Badge variant="info">Nova</Badge>}
                    <span className="ml-auto text-xs text-gray-400">{fromNow(n.criadaEm)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{n.mensagem}</p>
                </div>
                {!n.lida && (
                  <button
                    onClick={() => marcarLida(n.id)}
                    className="shrink-0 rounded p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    title="Marcar como lida"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

export default Notifications
