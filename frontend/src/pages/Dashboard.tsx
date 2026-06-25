import { useEffect, useState } from 'react'
import { Package, Archive, Truck, AlertTriangle } from 'lucide-react'
import { DashboardService } from '@/services/DashboardService'
import type { DashboardResumo, RecebidoPorMes, TopDoador, PorEntidade } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { ChartReceived } from '@/components/dashboard/ChartReceived'
import { ChartTopDonors } from '@/components/dashboard/ChartTopDonors'
import { ChartByEntity } from '@/components/dashboard/ChartByEntity'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import {
  DEMO_RESUMO, DEMO_RECEBIDO_POR_MES, DEMO_TOP_DOADORES, DEMO_POR_ENTIDADE,
} from '@/mocks/demoData'

export function Dashboard() {
  const { isDemo } = useAuth()
  const [resumo, setResumo] = useState<DashboardResumo | null>(null)
  const [recebido, setRecebido] = useState<RecebidoPorMes[]>([])
  const [doadores, setDoadores] = useState<TopDoador[]>([])
  const [entidades, setEntidades] = useState<PorEntidade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      if (isDemo) {
        setResumo(DEMO_RESUMO)
        setRecebido(DEMO_RECEBIDO_POR_MES)
        setDoadores(DEMO_TOP_DOADORES)
        setEntidades(DEMO_POR_ENTIDADE)
        setLoading(false)
        return
      }
      try {
        const [r, rec, doad, ent] = await Promise.all([
          DashboardService.resumo(),
          DashboardService.recebidoPorMes(),
          DashboardService.topDoadores(),
          DashboardService.porEntidade(),
        ])
        setResumo(r)
        setRecebido(rec)
        setDoadores(doad)
        setEntidades(ent)
      } catch {
        setError('Não foi possível carregar os dados do dashboard.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [isDemo])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Alimentos Cadastrados"
          value={resumo?.total_alimentos ?? 0}
          icon={Package}
          variant="default"
        />
        <KpiCard
          title="Lotes em Estoque"
          value={resumo?.total_lotes ?? 0}
          icon={Archive}
          variant="success"
        />
        <KpiCard
          title="Distribuições"
          value={resumo?.total_distribuicoes ?? 0}
          icon={Truck}
          variant="default"
        />
        <KpiCard
          title="Lotes Vencendo"
          value={resumo?.lotes_vencendo ?? 0}
          icon={AlertTriangle}
          variant={(resumo?.lotes_vencendo ?? 0) > 0 ? 'warning' : 'default'}
          subtitle={(resumo?.lotes_vencendo ?? 0) > 0 ? 'Requer atenção' : 'Tudo em dia'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="font-semibold text-gray-800">Alimentos Recebidos por Mês</h3>
          </CardHeader>
          <CardBody>
            {recebido.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">Sem dados disponíveis.</p>
            ) : (
              <ChartReceived data={recebido} />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-800">Distribuição por Entidade</h3>
          </CardHeader>
          <CardBody>
            {entidades.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">Sem dados disponíveis.</p>
            ) : (
              <ChartByEntity data={entidades} />
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <h3 className="font-semibold text-gray-800">Top Doadores</h3>
          </CardHeader>
          <CardBody>
            {doadores.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">Sem dados disponíveis.</p>
            ) : (
              <ChartTopDonors data={doadores} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
