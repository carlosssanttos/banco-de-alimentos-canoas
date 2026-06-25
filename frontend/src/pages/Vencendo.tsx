import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, AlertOctagon } from 'lucide-react'
import { LotesService } from '@/services/LotesService'
import { AlimentosService } from '@/services/AlimentosService'
import { ParceirosService } from '@/services/ParceirosService'
import type { Lote, Alimento, Parceiro } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { Alert } from '@/components/ui/Alert'
import { formatDate, daysUntil } from '@/utils/formatDate'
import { formatQuantidade } from '@/utils/formatNumber'
import { DEMO_LOTES, DEMO_ALIMENTOS, DEMO_PARCEIROS } from '@/mocks/demoData'

export function Vencendo() {
  const { isDemo } = useAuth()
  const [data, setData] = useState<Lote[]>([])
  const [alimentos, setAlimentos] = useState<Alimento[]>([])
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [estragadoTarget, setEstragadoTarget] = useState<Lote | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    if (isDemo) {
      // Filtra lotes com validade nos próximos 60 dias
      const hoje = new Date()
      const limite = new Date(hoje); limite.setDate(hoje.getDate() + 60)
      const vencendo = DEMO_LOTES.filter((l) => {
        if (!l.data_validade || l.esta_estragado) return false
        const val = new Date(l.data_validade)
        return val <= limite
      })
      setData(vencendo); setAlimentos(DEMO_ALIMENTOS); setParceiros(DEMO_PARCEIROS)
      setIsLoading(false); return
    }
    try {
      const [lotes, alims, parcs] = await Promise.all([
        LotesService.vencendo(60),
        AlimentosService.listar(),
        ParceirosService.listar(),
      ])
      setData(lotes)
      setAlimentos(alims)
      setParceiros(parcs)
      setError('')
    } catch {
      setError('Erro ao carregar lotes vencendo.')
    } finally {
      setIsLoading(false)
    }
  }, [isDemo])

  useEffect(() => { void fetchData() }, [fetchData])

  async function handleEstragado() {
    if (!estragadoTarget) return
    try {
      await LotesService.marcarEstragado(estragadoTarget.id)
      setEstragadoTarget(null)
      await fetchData()
    } catch {
      setError('Erro ao marcar lote como estragado.')
      setEstragadoTarget(null)
    }
  }

  const alimentoMap = Object.fromEntries(alimentos.map((a) => [a.id, a.nome]))
  const parceiroMap = Object.fromEntries(parceiros.map((p) => [p.id, p.nome]))

  function diasBadge(lote: Lote) {
    const dias = daysUntil(lote.data_validade ?? null) ?? 999
    if (dias <= 0) return <Badge variant="danger">Vencido há {Math.abs(dias)}d</Badge>
    if (dias <= 7) return <Badge variant="danger">{dias} dia{dias !== 1 ? 's' : ''}</Badge>
    if (dias <= 30) return <Badge variant="warning">{dias} dias</Badge>
    return <Badge variant="info">{dias} dias</Badge>
  }

  const columns = [
    { key: 'alimento', header: 'Alimento', render: (r: Lote) => alimentoMap[r.id_alimento] || r.alimento_nome || '—' },
    { key: 'quantidade', header: 'Quantidade', render: (r: Lote) => formatQuantidade(r.quantidade) },
    { key: 'validade', header: 'Validade', render: (r: Lote) => formatDate(r.data_validade) },
    { key: 'dias', header: 'Dias Restantes', render: (r: Lote) => diasBadge(r) },
    { key: 'parceiro', header: 'Doador', render: (r: Lote) => parceiroMap[r.id_parceiro ?? ''] || r.parceiro_nome || '—' },
    {
      key: 'acoes', header: 'Ações', className: 'w-36',
      render: (r: Lote) => (
        !r.esta_estragado ? (
          <Button variant="danger" size="sm" onClick={() => setEstragadoTarget(r)}>
            <AlertOctagon size={14} /> Estragado
          </Button>
        ) : <Badge variant="danger">Descartado</Badge>
      ),
    },
  ]

  const criticos = data.filter((l) => (daysUntil(l.data_validade ?? null) ?? 999) <= 7)

  return (
    <>
      <PageHeader title="Lotes Vencendo" subtitle="Alimentos próximos ou além da data de validade (60 dias)" />

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {criticos.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <strong>{criticos.length} lote{criticos.length !== 1 ? 's' : ''}</strong> vence{criticos.length !== 1 ? 'm' : ''} em até 7 dias e requer{criticos.length !== 1 ? 'em' : ''} atenção imediata.
        </Alert>
      )}

      {data.length > 0 && !isLoading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <AlertTriangle size={16} className="text-yellow-500" />
          {data.length} lote{data.length !== 1 ? 's' : ''} vencendo nos próximos 60 dias
        </div>
      )}

      <Table columns={columns} data={data} keyField="id" isLoading={isLoading} emptyMessage="Nenhum lote próximo do vencimento. Tudo em dia!" />

      <Modal isOpen={!!estragadoTarget} onClose={() => setEstragadoTarget(null)} title="Marcar como Estragado" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEstragadoTarget(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleEstragado}>Confirmar</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Confirma que o lote de <strong>{alimentoMap[estragadoTarget?.id_alimento ?? ''] || 'alimento'}</strong> com validade em{' '}
          <strong>{formatDate(estragadoTarget?.data_validade)}</strong> está estragado?
        </p>
      </Modal>
    </>
  )
}
